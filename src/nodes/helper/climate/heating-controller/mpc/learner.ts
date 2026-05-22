import {
  convertToMilliseconds,
  TimeIntervalUnit,
} from "../../../../../helpers/time.helper";
import {
  LearningFactors,
  LearningStatus,
  PersistedLearningFactors,
  RoomModelLearningState,
  RoomMpcInput,
} from "./types";
import { ThermalCapacityModel } from "./models/capacity";
import { RoomLossModel } from "./models/loss";

const LEARNING_INTERVAL_MINUTES = 30;

const HISTORY_RETENTION_MINUTES = 180;

export type LearnerHistoryEntry = {
  timestamp: number;

  roomTemperatureC: number;

  outdoorTemperatureC: number;

  flowTemperatureC?: number;

  appliedHeatingPowerW: number;
};

export type LearnerPrediction = {
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

  private lastPersistedFactorsJson?: string;

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

    if (relevantHistory.length === 0) {
      this.learningState = this.createLearningState(
        LearningStatus.waitingInterval,
      );

      this.rotateLearningWindow();

      return;
    }

    // TODO:
    // - Validate thresholds
    // - Compare prediction vs reality
    // - Learn UA factor
    // - Learn capacity factor

    this.learningState = this.createLearningState(LearningStatus.active);

    this.rotateLearningWindow();
  }

  private rotateLearningWindow(): void {
    this.currentWindowInvalid = this.nextWindowInvalid;

    this.nextWindowInvalid = false;

    this.activePrediction = this.lastPrediction;

    this.lastPrediction = undefined;
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

  private cleanupHistory(nowTs: number): void {
    for (let i = this.history.length - 1; i >= 0; i--) {
      if (nowTs - this.history[i].timestamp > this.historyRetentionMs) {
        this.history.splice(i, 1);
      }
    }
  }

  public recalibrate(factors: PersistedLearningFactors): void {
    this.lossModel.learnedUaFactor = factors.uaFactor;

    this.capacityModel.learnedCapacityFactor = factors.capacityFactor;

    this.learningState = this.createLearningState(this.learningState.status);
  }

  public consumePersistedLearningFactors(): PersistedLearningFactors | null {
    const factors = new PersistedLearningFactors(
      this.getCurrentLearningFactors(),
      1,
    );

    const json = factors.toJson();

    if (json === this.lastPersistedFactorsJson) {
      return null;
    }

    this.lastPersistedFactorsJson = json;

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
