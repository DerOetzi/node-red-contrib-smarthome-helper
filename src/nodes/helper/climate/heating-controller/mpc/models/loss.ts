import { clamp } from "../../../../../../helpers/math.helper";
import { HeatingMPCControllerNodeOptions } from "../types";

export const MIN_LEARNED_UA_FACTOR = 0.5;
export const MAX_LEARNED_UA_FACTOR = 2;

export class RoomLossModel {
  private _learnedUaFactor = 1;

  private readonly baseUaWPerK: number;

  constructor(config: HeatingMPCControllerNodeOptions) {
    const designTemperatureDeltaC =
      config.designIndoorTemperatureC - config.designOutdoorTemperatureC;

    this.baseUaWPerK =
      config.roomHeatLoadW / Math.max(0.1, designTemperatureDeltaC);
  }

  public calculateHeatLossW(
    temperatureC: number,
    outdoorTemperatureC: number,
  ): number {
    return this.effectiveUaWPerK * (temperatureC - outdoorTemperatureC);
  }

  public set learnedUaFactor(value: number) {
    this._learnedUaFactor = clamp(
      value,
      MIN_LEARNED_UA_FACTOR,
      MAX_LEARNED_UA_FACTOR,
    );
  }

  public get learnedUaFactor(): number {
    return this._learnedUaFactor;
  }

  public get effectiveUaWPerK(): number {
    return this.baseUaWPerK * this.learnedUaFactor;
  }
}
