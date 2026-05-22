import {
  LearningFactors,
  LearningStatus,
  PersistedLearningFactors,
  RoomModelLearningState,
  RoomModelPrediction,
  RoomMpcInput,
} from "./types";

import { clamp } from "../../../../../helpers/math.helper";
import { ThermalCapacityModel } from "./models/capacity";
import { RoomLossModel } from "./models/loss";

const PERSISTENCE_VERSION = 1;
const CAPACITY_LEARNING_RATE = 0.002;
const MAX_PREDICTION_ERROR_C = 3;
const MAX_UA_LEARNING_HEATING_POWER_W = 200;
const MIN_CAPACITY_LEARNING_HEATING_POWER_W = 150;
const MIN_DELTA_C_FOR_LEARNING = 0.05;
const MIN_LEARNING_INTERVAL_SECONDS = 300;
const PERSISTENCE_THRESHOLD = 0.002;
const UA_LEARNING_RATE = 0.0005;

export class RoomMPCModelLearner {
  private lastRoomTemperatureC?: number;

  private lastTimestamp?: number;

  private lastPrediction?: RoomModelPrediction;

  private pendingPersistedFactors?: PersistedLearningFactors;

  private lastPersistedFactors?: PersistedLearningFactors;

  constructor(
    private readonly lossModel: RoomLossModel,
    private readonly capacityModel: ThermalCapacityModel,
  ) {}

  public update(
    input: RoomMpcInput,
    appliedHeatingPowerW: number,
  ): RoomModelLearningState {
    if (!this.hasPreviousState()) {
      this.initializeState(input.roomTempC, input.nowTs);

      return this.getLearningState(
        LearningStatus.initializing,
        appliedHeatingPowerW,
      );
    }

    const durationSeconds = this.calculateDurationSeconds(input.nowTs);

    if (!this.isLearningIntervalReached(durationSeconds)) {
      return this.getLearningState(
        LearningStatus.waitingInterval,
        appliedHeatingPowerW,
      );
    }

    const prediction = this.createPrediction(
      input.roomTempC,
      input.outdoorTempC,
      appliedHeatingPowerW,
      durationSeconds,
      input.nowTs,
    );

    const learningFactors = this.calculateLearningFactors(
      prediction,
      appliedHeatingPowerW,
    );

    const appliedLearningFactors = this.applyLearningFactors(learningFactors);
    if (
      !this.lastPersistedFactors ||
      this.haveLearningFactorsChanged(
        this.lastPersistedFactors.factors,
        appliedLearningFactors,
      )
    ) {
      this.pendingPersistedFactors = this.createPersistedLearningFactors();
    }

    this.storePredictionState(prediction, input.roomTempC, input.nowTs);
    return this.getLearningState(LearningStatus.active, appliedHeatingPowerW);
  }

  private applyLearningFactors(factors: LearningFactors): LearningFactors {
    this.lossModel.learnedUaFactor = factors.uaFactor;
    this.capacityModel.learnedCapacityFactor = factors.capacityFactor;

    return this.getLearningFactors();
  }

  private getLearningFactors(): LearningFactors {
    return {
      uaFactor: this.lossModel.learnedUaFactor,
      capacityFactor: this.capacityModel.learnedCapacityFactor,
    };
  }

  public getLearningState(
    status: LearningStatus,
    appliedHeatingPowerW?: number,
  ): RoomModelLearningState {
    return {
      status,
      learnedFactors: this.getLearningFactors(),
      prediction: this.lastPrediction,
      appliedHeatingPowerW,
    };
  }

  public consumePersistedLearningFactors(): PersistedLearningFactors | null {
    if (this.pendingPersistedFactors) {
      this.lastPersistedFactors = this.pendingPersistedFactors;
      this.pendingPersistedFactors = undefined;
      return this.lastPersistedFactors;
    }

    return null;
  }

  public getLastPrediction(): RoomModelPrediction | undefined {
    return this.lastPrediction;
  }

  private haveLearningFactorsChanged(
    current: LearningFactors,
    next: LearningFactors,
  ): boolean {
    return (
      Math.abs(current.uaFactor - next.uaFactor) >= PERSISTENCE_THRESHOLD ||
      Math.abs(current.capacityFactor - next.capacityFactor) >=
        PERSISTENCE_THRESHOLD
    );
  }

  private createPersistedLearningFactors(): PersistedLearningFactors {
    return new PersistedLearningFactors(
      this.getLearningFactors(),
      PERSISTENCE_VERSION,
    );
  }

  public recalibrate(factors: PersistedLearningFactors): void {
    this.applyLearningFactors(factors.factors);
    this.resetState();
    this.lastPersistedFactors = this.createPersistedLearningFactors();
  }

  public reset(): void {
    this.resetState();
    this.lastPersistedFactors = undefined;
    this.applyLearningFactors({ uaFactor: 1, capacityFactor: 1 });
  }

  private resetState(): void {
    this.lastRoomTemperatureC = undefined;
    this.lastTimestamp = undefined;
    this.lastPrediction = undefined;
    this.pendingPersistedFactors = undefined;
  }

  private hasPreviousState(): boolean {
    return (
      this.lastRoomTemperatureC !== undefined &&
      this.lastTimestamp !== undefined
    );
  }

  private initializeState(roomTemperatureC: number, timestamp: number): void {
    this.lastRoomTemperatureC = roomTemperatureC;

    this.lastTimestamp = timestamp;
  }

  private calculateDurationSeconds(timestamp: number): number {
    return (timestamp - (this.lastTimestamp ?? timestamp)) / 1000;
  }

  private isLearningIntervalReached(durationSeconds: number): boolean {
    return durationSeconds >= MIN_LEARNING_INTERVAL_SECONDS;
  }

  private createPrediction(
    roomTemperatureC: number,
    outdoorTemperatureC: number,
    heatingPowerW: number,
    durationSeconds: number,
    timestamp: number,
  ): RoomModelPrediction {
    /* TODO refactor
    const actualDeltaC =
      roomTemperatureC - (this.lastRoomTemperatureC ?? roomTemperatureC);

    const heatLossW = this.thermalModel.calculateHeatLoss(
      roomTemperatureC,
      outdoorTemperatureC,
    );

    const netHeatingPowerW = heatingPowerW - heatLossW;

    const predictedDeltaC = this.thermalModel.predictTemperatureChange(
      netHeatingPowerW,
      durationSeconds,
    );

    const predictionErrorC = this.calculatePredictionError(
      actualDeltaC,
      predictedDeltaC,
    );

    return {
      predictedTempC:
        (this.lastRoomTemperatureC ?? roomTemperatureC) + predictedDeltaC,

      actualTempC: roomTemperatureC,

      predictedDeltaC,
      actualDeltaC,

      modelErrorC: predictionErrorC,

      timestamp,
    };

    */
    return {
      predictedTempC: roomTemperatureC,
      actualTempC: roomTemperatureC,
      predictedDeltaC: 0,
      actualDeltaC: 0,
      modelErrorC: 0,
      timestamp,
    };
  }

  private calculatePredictionError(
    actualDeltaC: number,
    predictedDeltaC: number,
  ): number {
    return clamp(
      actualDeltaC - predictedDeltaC,
      -MAX_PREDICTION_ERROR_C,
      MAX_PREDICTION_ERROR_C,
    );
  }

  private calculateLearningFactors(
    prediction: RoomModelPrediction,
    heatingPowerW: number,
  ): LearningFactors {
    const currentFactors = this.getLearningFactors();

    return {
      uaFactor: this.canLearnUa(heatingPowerW)
        ? this.calculateNextUaFactor(currentFactors.uaFactor, prediction)
        : currentFactors.uaFactor,

      capacityFactor: this.canLearnCapacity(heatingPowerW)
        ? this.calculateNextCapacityFactor(
            currentFactors.capacityFactor,
            prediction,
          )
        : currentFactors.capacityFactor,
    };
  }

  private canLearnUa(heatingPowerW: number): boolean {
    return heatingPowerW <= MAX_UA_LEARNING_HEATING_POWER_W;
  }

  private canLearnCapacity(heatingPowerW: number): boolean {
    return heatingPowerW >= MIN_CAPACITY_LEARNING_HEATING_POWER_W;
  }

  private calculateNextUaFactor(
    currentUaFactor: number,
    prediction: RoomModelPrediction,
  ): number {
    if (Math.abs(prediction.actualDeltaC) < MIN_DELTA_C_FOR_LEARNING) {
      return currentUaFactor;
    }

    const direction = -Math.sign(prediction.modelErrorC);

    return (
      currentUaFactor +
      direction * Math.abs(prediction.modelErrorC) * UA_LEARNING_RATE
    );
  }

  private calculateNextCapacityFactor(
    currentCapacityFactor: number,
    prediction: RoomModelPrediction,
  ): number {
    if (Math.abs(prediction.predictedDeltaC) < MIN_DELTA_C_FOR_LEARNING) {
      return currentCapacityFactor;
    }

    const direction = -Math.sign(prediction.modelErrorC);

    return (
      currentCapacityFactor +
      direction * Math.abs(prediction.modelErrorC) * CAPACITY_LEARNING_RATE
    );
  }

  private storePredictionState(
    prediction: RoomModelPrediction,
    roomTemperatureC: number,
    timestamp: number,
  ): void {
    this.lastPrediction = prediction;

    this.lastRoomTemperatureC = roomTemperatureC;

    this.lastTimestamp = timestamp;
  }
}
