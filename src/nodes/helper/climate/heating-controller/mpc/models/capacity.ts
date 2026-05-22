import { clamp } from "../../../../../../helpers/math.helper";
import { HeatingMPCControllerNodeOptions } from "../types";

const DEFAULT_CAPACITY_SECONDS = 7200;
const MAX_ROOM_ERROR = 2;
const CATCHUP_TIME_SECONDS = 3600;
const MAX_CATCHUP_POWER_RATIO = 0.5;

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

  public calculateCatchupPowerW(
    targetTempC: number,
    currentTempC: number,
    availableHeatingPowerW: number,
  ): number {
    const roomError = targetTempC - currentTempC;
    const limitedError = clamp(roomError, -MAX_ROOM_ERROR, MAX_ROOM_ERROR);

    // Formel: P = (C_effective / t_catchup) * dT
    const theoreticalCatchupPower =
      (this.effectiveCapacityJPerK / CATCHUP_TIME_SECONDS) * limitedError;

    const maxCatchupPower = availableHeatingPowerW * MAX_CATCHUP_POWER_RATIO;

    // Symmetrische Begrenzung (Verhindert unkontrolliert negative Werte bei Überhitzung)
    return clamp(theoreticalCatchupPower, -maxCatchupPower, maxCatchupPower);
  }

  public set learnedCapacityFactor(value: number) {
    this._learnedCapacityFactor = clamp(value, 0.5, 3);
  }

  public get learnedCapacityFactor(): number {
    return this._learnedCapacityFactor;
  }

  public get effectiveCapacityJPerK(): number {
    return this.baseCapacityJPerK * this.learnedCapacityFactor;
  }
}
