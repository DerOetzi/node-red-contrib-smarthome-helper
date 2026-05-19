import {
  LearningFactors,
  LearningStatus,
  PersistedLearningFactors,
  RoomModelLearningState,
  RoomModelPrediction,
  RoomMpcInput,
} from "./types";

import { clamp } from "../../../../../helpers/math.helper";
import {
  CAPACITY_LEARNING_RATE,
  MAX_PREDICTION_ERROR_C,
  MAX_UA_LEARNING_HEATING_POWER_W,
  MIN_CAPACITY_LEARNING_HEATING_POWER_W,
  MIN_LEARNING_INTERVAL_SECONDS,
  PERSISTENCE_THRESHOLD,
  PERSISTENCE_VERSION,
  UA_LEARNING_RATE,
} from "./const";
import { RoomThermalModel } from "./model";

export class RoomMPCModelLearner {
  private lastRoomTemperatureC?: number;

  private lastTimestamp?: number;

  private lastPrediction?: RoomModelPrediction;

  private pendingPersistedFactors?: PersistedLearningFactors;

  private lastPersistedFactors?: PersistedLearningFactors;

  constructor(private readonly thermalModel: RoomThermalModel) {}

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

    this.applyLearningFactors(learningFactors);

    if (
      !this.lastPersistedFactors ||
      this.haveLearningFactorsChanged(
        this.lastPersistedFactors.factors,
        learningFactors,
      )
    ) {
      this.pendingPersistedFactors = this.createPersistedLearningFactors();
    }

    this.storePredictionState(prediction, input.roomTempC, input.nowTs);
    return this.getLearningState(LearningStatus.active, appliedHeatingPowerW);
  }

  public getLearningState(
    status: LearningStatus,
    appliedHeatingPowerW?: number,
  ): RoomModelLearningState {
    return {
      status,
      learnedFactors: this.thermalModel.getLearningFactors(),
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
    return {
      version: PERSISTENCE_VERSION,
      factors: this.thermalModel.getLearningFactors(),
    };
  }

  public recalibrate(factors: PersistedLearningFactors): void {
    this.thermalModel.setLearningFactors(factors.factors);
    this.reset();
    this.lastPersistedFactors = this.createPersistedLearningFactors();
  }

  public reset(): void {
    this.lastRoomTemperatureC = undefined;
    this.lastTimestamp = undefined;
    this.lastPrediction = undefined;
    this.pendingPersistedFactors = undefined;
    this.lastPersistedFactors = undefined;
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
    const currentFactors = this.thermalModel.getLearningFactors();

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
    if (Math.abs(prediction.actualDeltaC) < 0.05) {
      return currentUaFactor;
    }

    const direction = prediction.modelErrorC > 0 ? -1 : 1;

    return (
      currentUaFactor +
      direction * Math.abs(prediction.modelErrorC) * UA_LEARNING_RATE
    );
  }

  private calculateNextCapacityFactor(
    currentCapacityFactor: number,
    prediction: RoomModelPrediction,
  ): number {
    if (Math.abs(prediction.predictedDeltaC) < 0.05) {
      return currentCapacityFactor;
    }

    const direction =
      prediction.actualDeltaC < prediction.predictedDeltaC ? 1 : -1;

    return (
      currentCapacityFactor +
      direction * Math.abs(prediction.modelErrorC) * CAPACITY_LEARNING_RATE
    );
  }

  private applyLearningFactors(learningFactors: LearningFactors): void {
    this.thermalModel.updateLearningFactors(learningFactors);
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
