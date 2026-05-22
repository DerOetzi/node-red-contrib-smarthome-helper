import { clamp } from "../../../../../../helpers/math.helper";
import { HeatingMPCControllerNodeOptions } from "../types";

export class RoomLossModel {
  private _learnedUaFactor = 1;

  private readonly baseUaWPerK: number;

  constructor(config: HeatingMPCControllerNodeOptions) {
    const designTemperatureDeltaC =
      config.designIndoorTemperatureC - config.designOutdoorTemperatureC;

    this.baseUaWPerK =
      config.roomHeatLoadW / Math.max(0.1, designTemperatureDeltaC);
  }

  public calculateRequiredHeatingPowerW(
    targetTemperatureC: number,
    outdoorTemperatureC: number,
  ): number {
    return this.calculateHeatLossW(targetTemperatureC, outdoorTemperatureC);
  }

  public calculateHeatLossW(
    roomTemperatureC: number,
    outdoorTemperatureC: number,
  ): number {
    return this.effectiveUaWPerK * (roomTemperatureC - outdoorTemperatureC);
  }

  public set learnedUaFactor(value: number) {
    this._learnedUaFactor = clamp(value, 0.5, 2);
  }

  public get learnedUaFactor(): number {
    return this._learnedUaFactor;
  }

  public get effectiveUaWPerK(): number {
    return this.baseUaWPerK * this.learnedUaFactor;
  }
}
