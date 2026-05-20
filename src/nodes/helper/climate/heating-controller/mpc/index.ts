import { Node } from "node-red";
import { clamp, roundToStep } from "../../../../../helpers/math.helper";
import {
  convertToMilliseconds,
  TimeIntervalUnit,
} from "../../../../../helpers/time.helper";
import { APPLIED_POWER_MAX_AGE_MINUTES } from "./const";
import { RoomMPCModelLearner } from "./learner";
import { RoomDistributionModel, RoomThermalModel } from "./model";
import { ActorStateEntry, RoomMPCSensors } from "./sensors";
import {
  HeatingMPCControllerNodeOptions,
  LearningStatus,
  PersistedLearningFactors,
  RoomModelLearningState,
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

  private targetDemandPct = 0;
  private lastOutputDemandPct = 0;
  private lastDemandUpdateTs = 0;

  private learningEnabled: boolean;

  private learningSuppressedUntilTs = 0;

  constructor(node: Node, config: HeatingMPCControllerNodeOptions) {
    this.config = config;

    this.sensors = new RoomMPCSensors(config);

    this.thermalModel = new RoomThermalModel(node, config);
    this.distributionModel = new RoomDistributionModel(config);

    this.appliedHeatingPowerW = new ActorStateEntry(
      convertToMilliseconds(APPLIED_POWER_MAX_AGE_MINUTES, TimeIntervalUnit.m),
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

    const stabilizedDemandPct = this.applyDemandRateLimiting(
      input,
      requestedDemandPct,
    );

    const recommendedFlowTemperatureC =
      this.thermalModel.calculateRecommendedFlowTemperature(
        requestedHeatingPowerW,
      );

    const learningState = this.handleLearning(input);

    const result = this.createResult(
      input,
      learningState,
      stabilizedDemandPct,
      requestedHeatingPowerW,
      availableHeatingPowerW,
      recommendedFlowTemperatureC,
    );

    return result;
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

    return roundToStep(baseHeatingPower + catchupPower, 0.01);
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

  private applyDemandRateLimiting(
    input: RoomMpcInput,
    demandPct: number,
  ): number {
    this.targetDemandPct = clamp(
      demandPct,
      this.targetDemandPct - this.config.mpcMaxDemandStepPct,
      this.targetDemandPct + this.config.mpcMaxDemandStepPct,
    );

    if (
      Math.abs(this.targetDemandPct - this.lastOutputDemandPct) <
      this.config.mpcDemandHysteresisPct
    ) {
      return this.lastOutputDemandPct;
    }

    if (
      input.nowTs - this.lastDemandUpdateTs < this.holdTimeMs &&
      Math.abs(this.targetDemandPct - this.lastOutputDemandPct) <
        this.config.mpcHoldOverrideDemandPct
    ) {
      return this.lastOutputDemandPct;
    }

    this.lastOutputDemandPct = this.targetDemandPct;
    this.lastDemandUpdateTs = input.nowTs;
    return this.lastOutputDemandPct;
  }

  private handleLearning(input: RoomMpcInput): RoomModelLearningState {
    const appliedHeatingPowerW = this.appliedHeatingPowerW.getFreshValue(
      input.nowTs,
    );

    if (this.learningEnabled) {
      if (this.isLearningSuppressed()) {
        return this.learner.getLearningState(
          LearningStatus.suppressed,
          appliedHeatingPowerW,
        );
      } else if (appliedHeatingPowerW === undefined) {
        return this.learner.getLearningState(
          LearningStatus.missingAppliedPower,
        );
      } else {
        const learningState = this.learner.update(input, appliedHeatingPowerW);
        return learningState;
      }
    } else {
      return this.learner.getLearningState(
        LearningStatus.disabled,
        appliedHeatingPowerW,
      );
    }
  }

  private createResult(
    input: RoomMpcInput,
    learningState: RoomModelLearningState,
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
      learningState,
    };
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

  public enableLearning(): void {
    this.learningEnabled = true;
  }

  public disableLearning(): void {
    this.learningEnabled = false;
  }

  public suppressLearningForInterval(durationMs: number): void {
    this.learningSuppressedUntilTs = Date.now() + durationMs;
  }

  private isLearningSuppressed(): boolean {
    return Date.now() < this.learningSuppressedUntilTs;
  }
}
