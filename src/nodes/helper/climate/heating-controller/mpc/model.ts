import { Node } from "node-red";
import { clamp, roundToStep } from "../../../../../helpers/math.helper";
import {
  CATCHUP_TIME_SECONDS,
  DEFAULT_THERMAL_CAPACITY_PER_M3,
  DISTRIBUTION_ALPHA,
  MAX_CATCHUP_POWER_RATIO,
  MAX_FLOW_FACTOR,
  MAX_ROOM_ERROR,
  MIN_FLOW_FACTOR,
  RADIATOR_EXPONENT,
} from "./const";
import { HeatingMPCControllerNodeOptions, LearningFactors } from "./types";

export class RoomThermalModel {
  public readonly baseUaTotal: number;
  private learnedUaFactor = 1;

  public readonly baseThermalCapacityJPerK: number;
  private learnedCapacityFactor = 1;

  private readonly referenceFlowTemperature: number;
  private readonly referenceRoomTemperatureC: number;
  private readonly totalRadiatorPowerW: number;

  constructor(node: Node, config: HeatingMPCControllerNodeOptions) {
    this.referenceFlowTemperature = config.mpcReferenceFlowTemperature;
    this.referenceRoomTemperatureC = config.designIndoorTemperatureC;

    this.baseUaTotal = this.calculateTotalHeatLossCoefficient(config);

    this.baseThermalCapacityJPerK =
      DEFAULT_THERMAL_CAPACITY_PER_M3 * Math.max(0.1, config.roomVolumeM3);

    this.totalRadiatorPowerW = config.trvs.reduce(
      (sum, trv) => sum + trv.radiatorPowerW,
      0,
    );

    if (this.totalRadiatorPowerW <= 0) {
      node.warn(
        `Total radiator power is zero or negative (${this.totalRadiatorPowerW} W). Heating power will be calculated as zero.`,
      );
    }
  }

  private get effectiveUaTotal(): number {
    return this.baseUaTotal * this.learnedUaFactor;
  }

  private get effectiveThermalCapacityJPerK(): number {
    return this.baseThermalCapacityJPerK * this.learnedCapacityFactor;
  }

  private calculateTotalHeatLossCoefficient(
    config: HeatingMPCControllerNodeOptions,
  ): number {
    const deltaTDesign = Math.max(
      0.1,
      config.designIndoorTemperatureC - config.designOutdoorTemperatureC,
    );

    const uaTransmission = this.calculateTransmissionUa(config, deltaTDesign);
    const uaVentilation = this.calculateVentilationUa(config, deltaTDesign);

    const detailedUa = uaTransmission + uaVentilation;
    if (detailedUa > 0) {
      return detailedUa;
    }

    if (config.roomHeatLoadW > 0) {
      return config.roomHeatLoadW / deltaTDesign;
    }

    return this.calculateLastResortUa(config);
  }

  private calculateTransmissionUa(
    config: HeatingMPCControllerNodeOptions,
    deltaTDesign: number,
  ): number {
    return config.transmissionHeatLossExternalW > 0
      ? config.transmissionHeatLossExternalW / deltaTDesign
      : 0;
  }

  public calculateHeatLoss(
    roomTemperatureC: number,
    outdoorTemperatureC: number,
  ): number {
    return this.effectiveUaTotal * (roomTemperatureC - outdoorTemperatureC);
  }

  private calculateVentilationUa(
    config: HeatingMPCControllerNodeOptions,
    deltaTDesign: number,
  ): number {
    if (config.ventilationHeatLossW > 0) {
      return config.ventilationHeatLossW / deltaTDesign;
    }

    if (config.airChangeRate > 0) {
      return 0.33 * config.airChangeRate * config.roomVolumeM3;
    }

    return 0;
  }

  private calculateLastResortUa(
    config: HeatingMPCControllerNodeOptions,
  ): number {
    return Math.max(1, 0.33 * 0.5 * config.roomVolumeM3);
  }

  public calculateAvailableHeatingPower(flowTemperature?: number): number {
    if (this.totalRadiatorPowerW <= 0) {
      return 0;
    }

    const flowFactor = this.calculateFlowFactor(flowTemperature);

    return this.totalRadiatorPowerW * flowFactor;
  }

  public calculateRecommendedFlowTemperature(
    requiredHeatingPowerW: number,
  ): number | null {
    if (this.totalRadiatorPowerW <= 0 || requiredHeatingPowerW <= 0) {
      return null;
    }

    const requiredPowerRatio = requiredHeatingPowerW / this.totalRadiatorPowerW;

    const excessTempRef =
      this.referenceFlowTemperature - this.referenceRoomTemperatureC;

    if (excessTempRef <= 0) {
      return null;
    }

    const recommendedFlowTemp =
      this.referenceRoomTemperatureC +
      excessTempRef * Math.pow(requiredPowerRatio, 1 / RADIATOR_EXPONENT);

    return roundToStep(clamp(recommendedFlowTemp, 20, 90), 1);
  }

  public calculateBaseHeatingPower(
    targetTemperature: number,
    outdoorTemperature: number,
  ): number {
    return this.effectiveUaTotal * (targetTemperature - outdoorTemperature);
  }

  public calculateCatchupPower(
    targetTempC: number,
    currentTempC: number,
    availableHeatingPowerW: number,
  ): number {
    const roomError = targetTempC - currentTempC;
    const limitedError = clamp(roomError, -MAX_ROOM_ERROR, MAX_ROOM_ERROR);

    const theoreticalCatchupPower =
      (this.effectiveThermalCapacityJPerK / CATCHUP_TIME_SECONDS) *
      limitedError;

    const maxCatchupPower = availableHeatingPowerW * MAX_CATCHUP_POWER_RATIO;

    return Math.min(theoreticalCatchupPower, maxCatchupPower);
  }

  private calculateFlowFactor(flowTemperature?: number): number {
    if (flowTemperature === undefined) {
      return 1;
    }

    const excessTemp = flowTemperature - this.referenceRoomTemperatureC;
    const excessTempRef =
      this.referenceFlowTemperature - this.referenceRoomTemperatureC;

    if (excessTempRef <= 0) {
      return 1;
    }

    return clamp(
      Math.pow(Math.max(0, excessTemp) / excessTempRef, RADIATOR_EXPONENT),
      MIN_FLOW_FACTOR,
      MAX_FLOW_FACTOR,
    );
  }

  public predictTemperatureChange(
    netHeatingPowerW: number,
    durationSeconds: number,
  ): number {
    return (
      (netHeatingPowerW * durationSeconds) / this.effectiveThermalCapacityJPerK
    );
  }

  public updateLearningFactors(factors: LearningFactors): LearningFactors {
    return this.setLearningFactors(factors);
  }

  public setLearningFactors(factors: LearningFactors): LearningFactors {
    this.learnedUaFactor = clamp(factors.uaFactor, 0.5, 2);

    this.learnedCapacityFactor = clamp(factors.capacityFactor, 0.5, 3);

    return this.getLearningFactors();
  }

  public getLearningFactors(): LearningFactors {
    return {
      uaFactor: this.learnedUaFactor,
      capacityFactor: this.learnedCapacityFactor,
    };
  }
}

export class RoomDistributionModel {
  private readonly normalizedWeights: number[];

  private readonly minTargetTemperature: number;
  private readonly maxTargetTemperature: number;
  private readonly targetTemperatureStep: number;

  constructor(config: HeatingMPCControllerNodeOptions) {
    this.minTargetTemperature = config.minTargetTemperature;

    this.maxTargetTemperature = config.maxTargetTemperature;

    this.targetTemperatureStep = config.targetTemperatureStep;

    this.normalizedWeights = this.createNormalizedWeights(config);
  }

  public distributeDemand(demandPct: number): number[] {
    const demand = demandPct / 100;

    return this.normalizedWeights.map((weight) =>
      this.calculateTargetTemperature(demand, weight),
    );
  }

  private calculateTargetTemperature(demand: number, weight: number): number {
    const weightedDemand = Math.max(
      0,
      Math.min(1, demand * weight * this.normalizedWeights.length),
    );

    const targetTemperature =
      this.minTargetTemperature +
      weightedDemand * (this.maxTargetTemperature - this.minTargetTemperature);

    return roundToStep(targetTemperature, this.targetTemperatureStep);
  }

  private createNormalizedWeights(
    config: HeatingMPCControllerNodeOptions,
  ): number[] {
    const totalPower = config.trvs.reduce(
      (sum, trv) => sum + trv.radiatorPowerW,
      0,
    );

    if (totalPower <= 0) {
      return config.trvs.map(() => 0);
    }

    const weights = config.trvs.map((trv) => trv.radiatorPowerW / totalPower);

    const weightedDistribution = weights.map((weight) =>
      Math.pow(weight, DISTRIBUTION_ALPHA),
    );

    const weightedSum = weightedDistribution.reduce(
      (sum, value) => sum + value,
      0,
    );

    return weightedDistribution.map((weight) => weight / weightedSum);
  }
}
