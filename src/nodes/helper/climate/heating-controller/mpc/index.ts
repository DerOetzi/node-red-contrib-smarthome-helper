import { clamp } from "../../../../../helpers/math.helper";
import { convertToMilliseconds } from "../../../../../helpers/time.helper";
import { RoomMPCModelLearner } from "./learner";
import { RoomDistributionModel, RoomThermalModel } from "./model";
import { ActorStateEntry, RoomMPCSensors } from "./sensors";
import {
  HeatingMPCControllerNodeOptions,
  LearningStatus,
  PersistedLearningFactors,
  RoomMpcInput,
  RoomMpcResult,
  TrvIndex,
} from "./types";

export class RoomMPCController {
  private readonly config: HeatingMPCControllerNodeOptions;

  private readonly sensors: RoomMPCSensors;

  private readonly thermalModel: RoomThermalModel;
  private readonly distributionModel: RoomDistributionModel;

  private readonly learner: RoomMPCModelLearner;

  private readonly holdTimeMs: number;

  private readonly appliedHeatingPowerW: ActorStateEntry;

  private lastDemandPct = 0;
  private lastDemandUpdateTs = 0;

  private learningEnabled: boolean;

  private learningSuppressedUntilTs = 0;

  constructor(config: HeatingMPCControllerNodeOptions) {
    this.config = config;

    this.sensors = new RoomMPCSensors(config);

    this.thermalModel = new RoomThermalModel(config);
    this.distributionModel = new RoomDistributionModel(config);

    this.appliedHeatingPowerW = new ActorStateEntry(
      convertToMilliseconds(config.maxSensorAge, config.maxSensorAgeUnit),
    );

    this.learningEnabled = config.mpcLearningEnabledByDefault;
    this.learner = new RoomMPCModelLearner(this.thermalModel);

    this.holdTimeMs = convertToMilliseconds(
      config.mpcHoldTime,
      config.mpcHoldTimeUnit,
    );
  }

  public setTrvTemperature(index: TrvIndex, value: number | undefined): void {
    this.sensors.setTrvTemperature(index, value);
  }

  public setAdditionalSensor(value: number): void {
    this.sensors.setAdditionalTemperature(value);
  }

  public setOutdoorTemperature(value: number): void {
    this.sensors.setOutdoorTemperature(value);
  }

  public setFlowTemperature(value: number): void {
    this.sensors.setFlowTemperature(value);
  }

  public getRoomTemperature(): number | null {
    return this.sensors.getRoomTemperature().temperature;
  }

  public compute(targetTemperature: number): RoomMpcResult | null {
    const input = this.sensors.createInput(targetTemperature);

    if (!input) {
      return null;
    }

    const availableHeatingPowerW =
      this.thermalModel.calculateAvailableHeatingPower(input.flowTempC);

    if (availableHeatingPowerW <= 0) {
      return null;
    }

    const requestedHeatingPowerW = this.calculateRequestedHeatingPower(
      input,
      availableHeatingPowerW,
    );

    const requestedDemandPct = this.calculateRequestedDemandPct(
      requestedHeatingPowerW,
      availableHeatingPowerW,
    );

    const stabilizedDemandPct = this.stabilizeDemand(requestedDemandPct);

    const recommendedFlowTemperatureC =
      this.thermalModel.calculateRecommendedFlowTemperature(
        requestedHeatingPowerW,
      );

    const result = this.createResult(
      input,
      stabilizedDemandPct,
      requestedHeatingPowerW,
      availableHeatingPowerW,
      recommendedFlowTemperatureC,
    );

    this.handleLearning(result, input);

    return result;
  }

  private handleLearning(result: RoomMpcResult, input: RoomMpcInput) {
    const appliedHeatingPowerW = this.appliedHeatingPowerW.getFreshValue();

    if (this.learningEnabled) {
      if (this.isLearningSuppressed()) {
        result.learningState = this.learner.getLearningState(
          LearningStatus.suppressed,
          appliedHeatingPowerW,
        );
      } else if (appliedHeatingPowerW === undefined) {
        result.learningState = this.learner.getLearningState(
          LearningStatus.missingAppliedPower,
        );
      } else {
        const learningState = this.learner.update(input, appliedHeatingPowerW);
        result.learningState = learningState;
      }
    } else {
      result.learningState = this.learner.getLearningState(
        LearningStatus.disabled,
        appliedHeatingPowerW,
      );
    }
  }

  public setAppliedHeatingPower(powerW: number): void {
    this.appliedHeatingPowerW.value = powerW;
  }

  public consumePersistedLearningFactors(): PersistedLearningFactors | null {
    return this.learner.consumePersistedLearningFactors();
  }

  public recalibrateLearningFactors(factors: PersistedLearningFactors): void {
    this.learner.recalibrate(factors);
  }

  private calculateRequestedDemandPct(
    requestedHeatingPowerW: number,
    availableHeatingPowerW: number,
  ): number {
    const limitedHeatingPower = clamp(
      requestedHeatingPowerW,
      0,
      availableHeatingPowerW,
    );

    return (limitedHeatingPower / availableHeatingPowerW) * 100;
  }

  private calculateRequestedHeatingPower(
    input: RoomMpcInput,
    availableHeatingPowerW: number,
  ): number {
    const baseHeatingPower = this.thermalModel.calculateBaseHeatingPower(
      input.targetTempC,
      input.outdoorTempC,
    );

    const catchupPower = this.thermalModel.calculateCatchupPower(
      input.targetTempC,
      input.roomTempC,
      availableHeatingPowerW,
    );

    return baseHeatingPower + catchupPower;
  }

  private createResult(
    input: RoomMpcInput,
    stabilizedDemandPct: number,
    requestedHeatingPowerW: number,
    availableHeatingPowerW: number,
    recommendedFlowTemperatureC: number | null,
  ): RoomMpcResult {
    return {
      trvTargets: this.distributionModel.distributeDemand(stabilizedDemandPct),
      demandPct: stabilizedDemandPct,
      input: input,
      requestedHeatingPowerW,
      availableHeatingPowerW,
      recommendedFlowTemperatureC,
    };
  }

  private stabilizeDemand(demandPct: number): number {
    const now = Date.now();

    if (
      Math.abs(demandPct - this.lastDemandPct) <
      this.config.mpcDemandHysteresisPct
    ) {
      return this.lastDemandPct;
    }

    if (
      now - this.lastDemandUpdateTs < this.holdTimeMs &&
      Math.abs(demandPct - this.lastDemandPct) <
        this.config.mpcHoldOverrideDemandPct
    ) {
      return this.lastDemandPct;
    }

    const limitedDemandPct = clamp(
      demandPct,
      this.lastDemandPct - this.config.mpcMaxDemandStepPct,
      this.lastDemandPct + this.config.mpcMaxDemandStepPct,
    );

    this.lastDemandPct = limitedDemandPct;
    this.lastDemandUpdateTs = now;

    return limitedDemandPct;
  }

  public enableLearning(): void {
    this.learningEnabled = true;
  }

  public disableLearning(): void {
    this.learningEnabled = false;
  }

  public suppressLearningForInterval(durationTs: number): void {
    this.learningSuppressedUntilTs = Date.now() + durationTs;
  }

  private isLearningSuppressed(): boolean {
    return Date.now() < this.learningSuppressedUntilTs;
  }
}
