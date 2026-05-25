import {
  convertToMilliseconds,
  TimeIntervalUnit,
} from "../../../../../helpers/time.helper";
import {
  LearningFactors,
  LearningStatus,
  PersistedLearningFactors,
  RoomModelLearningState,
} from "./types";
import {
  MAX_LEARNED_CAPACITY_FACTOR,
  MIN_LEARNED_CAPACITY_FACTOR,
  ThermalCapacityModel,
} from "./models/capacity";
import {
  MAX_LEARNED_UA_FACTOR,
  MIN_LEARNED_UA_FACTOR,
  RoomLossModel,
} from "./models/loss";
import { clamp } from "../../../../../helpers/math.helper";
import { RoomMpcInput } from "./results";

const LEARNING_INTERVAL_MINUTES = 30;

const HISTORY_RETENTION_MINUTES = 180;

const MIN_HISTORY_SAMPLES = 5;

const UA_LEARNING_THRESHOLD_W = 300;

const MIN_ROOM_DELTA_C = 0.15;

const MAX_OUTDOOR_DELTA_C = 1;

const MAX_FLOW_DELTA_C = 5;

const UA_LEARNING_RATE = 0.0025;

const CAPACITY_LEARNING_RATE = 0.005;

type LearnerHistoryEntry = {
  timestamp: number;

  roomTemperatureC: number;

  outdoorTemperatureC: number;

  flowTemperatureC?: number;

  appliedHeatingPowerW: number;
};

type LearnerPrediction = {
  timestamp: number;

  predictedRoomTemperatureC: number;

  predictionHorizonSeconds: number;
};

export class RoomMPCModelLearner {
  private readonly learningIntervalMs = convertToMilliseconds(
    LEARNING_INTERVAL_MINUTES,
    TimeIntervalUnit.m,
  );

  private readonly historyRetentionMs = convertToMilliseconds(
    HISTORY_RETENTION_MINUTES,
    TimeIntervalUnit.m,
  );

  private readonly history: LearnerHistoryEntry[] = [];

  private activePrediction?: LearnerPrediction;

  private lastPrediction?: LearnerPrediction;

  private learningIntervalHandle?: ReturnType<typeof setInterval>;

  private suppressedUntilTs = 0;

  private currentWindowInvalid = false;

  private nextWindowInvalid = false;

  private pendingPersistedFactors: PersistedLearningFactors | null = null;

  private learningState: RoomModelLearningState = {
    status: LearningStatus.disabled,

    learnedFactors: {
      uaFactor: 1,
      capacityFactor: 1,
    },
  };

  constructor(
    private readonly lossModel: RoomLossModel,
    private readonly capacityModel: ThermalCapacityModel,
  ) {
    this.learningState.learnedFactors = this.getCurrentLearningFactors();
  }

  public destroy(): void {
    this.disable();
  }

  public enable(): void {
    if (this.learningIntervalHandle) {
      return;
    }

    this.activePrediction = undefined;
    this.lastPrediction = undefined;

    this.pendingPersistedFactors = null;

    this.learningIntervalHandle = setInterval(() => {
      this.runLearningCycle();
    }, this.learningIntervalMs);

    this.learningState = this.createLearningState(
      LearningStatus.waitingInterval,
    );
  }

  public disable(): void {
    if (this.learningIntervalHandle) {
      clearInterval(this.learningIntervalHandle);

      this.learningIntervalHandle = undefined;
      this.pendingPersistedFactors = null;
    }

    this.learningState = this.createLearningState(LearningStatus.disabled);
    this.activePrediction = undefined;
    this.lastPrediction = undefined;
    this.currentWindowInvalid = false;
    this.nextWindowInvalid = false;
  }

  public suppressForInterval(durationMs: number): void {
    this.suppressedUntilTs = Date.now() + durationMs;

    this.currentWindowInvalid = true;
    this.pendingPersistedFactors = null;

    this.learningState = this.createLearningState(LearningStatus.suppressed);
  }

  public appendHistory(
    input: RoomMpcInput,
    appliedHeatingPowerW: number,
  ): void {
    this.history.push({
      timestamp: input.nowTs,

      roomTemperatureC: input.roomTempC,

      outdoorTemperatureC: input.outdoorTempC,

      flowTemperatureC: input.flowTempC,

      appliedHeatingPowerW,
    });

    this.cleanupHistory(input.nowTs);
  }

  private cleanupHistory(nowTs: number): void {
    for (let i = this.history.length - 1; i >= 0; i--) {
      if (nowTs - this.history[i].timestamp > this.historyRetentionMs) {
        this.history.splice(i, 1);
      }
    }
  }

  public setPrediction(prediction: LearnerPrediction): void {
    this.lastPrediction = prediction;
  }

  public getLearningState(): RoomModelLearningState {
    return this.learningState;
  }

  private runLearningCycle(): void {
    if (Date.now() < this.suppressedUntilTs) {
      this.nextWindowInvalid = true;
    }

    if (this.currentWindowInvalid) {
      this.learningState = this.createLearningState(LearningStatus.suppressed);

      this.rotateLearningWindow();

      return;
    }

    if (!this.activePrediction) {
      this.learningState = this.createLearningState(
        LearningStatus.waitingInterval,
      );

      this.rotateLearningWindow();

      return;
    }

    const relevantHistory = this.getRelevantHistory(this.activePrediction);

    if (relevantHistory.length < MIN_HISTORY_SAMPLES) {
      this.learningState = this.createLearningState(
        LearningStatus.waitingInterval,
      );

      this.rotateLearningWindow();

      return;
    }

    if (!this.isHistoryValid(relevantHistory)) {
      this.learningState = this.createLearningState(LearningStatus.skipped);

      this.rotateLearningWindow();

      return;
    }

    const predictedRoomTemperatureC =
      this.activePrediction.predictedRoomTemperatureC;

    const actualRoomTemperatureC =
      this.calculateActualRoomTemperatureC(relevantHistory);

    const predictionErrorC = actualRoomTemperatureC - predictedRoomTemperatureC;

    const averageHeatingPowerW =
      this.calculateAverageHeatingPowerW(relevantHistory);

    if (Math.abs(predictionErrorC) < MIN_ROOM_DELTA_C) {
      this.learningState = this.createLearningState(LearningStatus.skipped);

      this.rotateLearningWindow();

      return;
    }

    if (averageHeatingPowerW < UA_LEARNING_THRESHOLD_W) {
      this.learnUaFactor(predictionErrorC);
    } else {
      this.learnCapacityFactor(predictionErrorC);
    }

    this.pendingPersistedFactors = new PersistedLearningFactors(
      this.getCurrentLearningFactors(),
      1,
    );

    this.learningState = this.createLearningState(LearningStatus.learned);

    this.rotateLearningWindow();
  }

  private getRelevantHistory(
    prediction: LearnerPrediction,
  ): LearnerHistoryEntry[] {
    const predictionEndTs =
      prediction.timestamp + prediction.predictionHorizonSeconds * 1000;

    return this.history.filter(
      (entry) =>
        entry.timestamp >= prediction.timestamp &&
        entry.timestamp <= predictionEndTs,
    );
  }

  private isHistoryValid(history: LearnerHistoryEntry[]): boolean {
    const outdoorTemperatures = history.map(
      (entry) => entry.outdoorTemperatureC,
    );

    const outdoorDeltaC =
      Math.max(...outdoorTemperatures) - Math.min(...outdoorTemperatures);

    if (outdoorDeltaC > MAX_OUTDOOR_DELTA_C) {
      return false;
    }

    const flowTemperatures = history
      .map((entry) => entry.flowTemperatureC)
      .filter(
        (value): value is number =>
          value !== undefined && !Number.isNaN(value) && Number.isFinite(value),
      );

    if (flowTemperatures.length > 0) {
      const flowDeltaC =
        Math.max(...flowTemperatures) - Math.min(...flowTemperatures);

      if (flowDeltaC > MAX_FLOW_DELTA_C) {
        return false;
      }
    }

    return true;
  }

  private calculateActualRoomTemperatureC(
    history: LearnerHistoryEntry[],
  ): number {
    const lastSamples = history.slice(-5);

    return (
      lastSamples.reduce((sum, entry) => sum + entry.roomTemperatureC, 0) /
      lastSamples.length
    );
  }

  private calculateAverageHeatingPowerW(
    history: LearnerHistoryEntry[],
  ): number {
    return (
      history.reduce((sum, entry) => sum + entry.appliedHeatingPowerW, 0) /
      history.length
    );
  }

  private learnUaFactor(predictionErrorC: number): void {
    const nextFactor =
      this.lossModel.learnedUaFactor *
      (1 - predictionErrorC * UA_LEARNING_RATE);

    this.lossModel.learnedUaFactor = clamp(
      nextFactor,
      MIN_LEARNED_UA_FACTOR,
      MAX_LEARNED_UA_FACTOR,
    );
  }

  private learnCapacityFactor(predictionErrorC: number): void {
    const nextFactor =
      this.capacityModel.learnedCapacityFactor *
      (1 - predictionErrorC * CAPACITY_LEARNING_RATE);

    this.capacityModel.learnedCapacityFactor = clamp(
      nextFactor,
      MIN_LEARNED_CAPACITY_FACTOR,
      MAX_LEARNED_CAPACITY_FACTOR,
    );
  }

  private rotateLearningWindow(): void {
    this.currentWindowInvalid = this.nextWindowInvalid;

    this.nextWindowInvalid = false;

    this.activePrediction = this.lastPrediction;

    this.lastPrediction = undefined;
  }

  public recalibrate(factors: PersistedLearningFactors): void {
    this.pendingPersistedFactors = null;
    this.lossModel.learnedUaFactor = factors.uaFactor;

    this.capacityModel.learnedCapacityFactor = factors.capacityFactor;

    this.learningState = this.createLearningState(this.learningState.status);
  }

  public consumePersistedLearningFactors(): PersistedLearningFactors | null {
    if (this.pendingPersistedFactors === null) {
      return null;
    }

    const factors = this.pendingPersistedFactors;
    this.pendingPersistedFactors = null;

    return factors;
  }

  private createLearningState(status: LearningStatus): RoomModelLearningState {
    return {
      status,

      learnedFactors: this.getCurrentLearningFactors(),
    };
  }

  private getCurrentLearningFactors(): LearningFactors {
    return {
      uaFactor: this.lossModel.learnedUaFactor,

      capacityFactor: this.capacityModel.learnedCapacityFactor,
    };
  }
}
