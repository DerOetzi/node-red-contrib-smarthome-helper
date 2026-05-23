import { clamp } from "../../../../../../helpers/math.helper";
import { HeatingMPCControllerNodeOptions } from "../types";

const DEFAULT_CAPACITY_SECONDS = 7200;

export const MIN_LEARNED_CAPACITY_FACTOR = 0.5;
export const MAX_LEARNED_CAPACITY_FACTOR = 3;

export class ThermalCapacityModel {
  private _learnedCapacityFactor = 1;

  private readonly baseCapacityJPerK: number;

  constructor(config: HeatingMPCControllerNodeOptions) {
    this.baseCapacityJPerK = config.roomHeatLoadW * DEFAULT_CAPACITY_SECONDS;
  }

  public predictTemperatureChangeC(
    netHeatingPowerW: number,
    durationSeconds: number,
  ): number {
    return (netHeatingPowerW * durationSeconds) / this.effectiveCapacityJPerK;
  }

  public calculateRequiredEnergyJ(
    currentTemperatureC: number,
    targetTemperatureC: number,
  ): number {
    return (
      (targetTemperatureC - currentTemperatureC) * this.effectiveCapacityJPerK
    );
  }

  public set learnedCapacityFactor(value: number) {
    this._learnedCapacityFactor = clamp(
      value,
      MIN_LEARNED_CAPACITY_FACTOR,
      MAX_LEARNED_CAPACITY_FACTOR,
    );
  }

  public get learnedCapacityFactor(): number {
    return this._learnedCapacityFactor;
  }

  public get effectiveCapacityJPerK(): number {
    return this.baseCapacityJPerK * this.learnedCapacityFactor;
  }
}
