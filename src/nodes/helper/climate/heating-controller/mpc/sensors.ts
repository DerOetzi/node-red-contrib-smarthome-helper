import { convertToMilliseconds } from "../../../../../helpers/time.helper";
import { TRV_MAX_COUNT } from "./const";
import {
  HeatingMPCControllerNodeOptions,
  RoomMpcInput,
  RoomTemperatureResult,
  RoomTemperatureStrategy,
  TrvIndex,
} from "./types";

class SensorEntry {
  private _value?: number;
  private _timestamp = 0;
  private readonly _maxAgeMs: number;

  constructor(maxAgeMs: number) {
    this._maxAgeMs = maxAgeMs;
  }

  public set value(newValue: number | undefined) {
    this._value = newValue;
    this._timestamp = Date.now();
  }

  public getFreshValue(nowTs: number = Date.now()): number | undefined {
    return this.isFresh(nowTs) ? this._value : undefined;
  }

  public get rawValue(): number | undefined {
    return this._value;
  }

  public isFresh(nowTs: number = Date.now()): boolean {
    if (this._value === undefined) {
      return false;
    }

    if (this._maxAgeMs <= 0) {
      return true;
    }

    return nowTs - this._timestamp <= this._maxAgeMs;
  }
}

export class RoomMPCSensors {
  private readonly trvTemperatures: SensorEntry[] = [];
  private readonly additionalTemperatureSensor: SensorEntry;
  private readonly outdoorTemperatureSensor: SensorEntry;
  private readonly flowTemperatureSensor: SensorEntry;

  private readonly roomTemperatureStrategy: RoomTemperatureStrategy;

  constructor(config: HeatingMPCControllerNodeOptions) {
    this.roomTemperatureStrategy = config.roomTemperatureStrategy;

    const maxSensorAgeMs =
      config.maxSensorAge <= 0
        ? 0
        : convertToMilliseconds(config.maxSensorAge, config.maxSensorAgeUnit);

    for (let i = 0; i < Math.min(config.trvs.length, TRV_MAX_COUNT); i++) {
      this.trvTemperatures.push(new SensorEntry(maxSensorAgeMs));
    }

    this.additionalTemperatureSensor = new SensorEntry(maxSensorAgeMs);

    this.outdoorTemperatureSensor = new SensorEntry(maxSensorAgeMs);

    this.flowTemperatureSensor = new SensorEntry(maxSensorAgeMs);
  }

  public setTrvTemperature(index: TrvIndex, value: number | undefined): void {
    if (index >= this.trvTemperatures.length) {
      return;
    }

    this.trvTemperatures[index].value = value;
  }

  public setAdditionalTemperature(value: number | undefined): void {
    this.additionalTemperatureSensor.value = value;
  }

  public setOutdoorTemperature(value: number | undefined): void {
    this.outdoorTemperatureSensor.value = value;
  }

  public setFlowTemperature(value: number | undefined): void {
    this.flowTemperatureSensor.value = value;
  }

  public getRoomTemperature(nowTs: number = Date.now()): RoomTemperatureResult {
    const trvTemperatures = this.getFreshTrvTemperatures(nowTs);

    const externalTemperature = this.getFreshExternalTemperature(nowTs);

    if (this.shouldUseExternalTemperature(externalTemperature)) {
      return this.createExternalTemperatureResult(
        externalTemperature,
        trvTemperatures,
      );
    }

    return this.createCalculatedRoomTemperatureResult(trvTemperatures);
  }

  private getFreshTrvTemperatures(nowTs: number): (number | undefined)[] {
    return this.trvTemperatures.map((entry) => entry.getFreshValue(nowTs));
  }

  private getFreshExternalTemperature(nowTs: number): number | undefined {
    return this.additionalTemperatureSensor.getFreshValue(nowTs);
  }

  private shouldUseExternalTemperature(
    externalTemperature: number | undefined,
  ): boolean {
    return (
      this.roomTemperatureStrategy === RoomTemperatureStrategy.external &&
      externalTemperature !== undefined
    );
  }

  private createExternalTemperatureResult(
    externalTemperature: number | undefined,
    trvTemperatures: (number | undefined)[],
  ): RoomTemperatureResult {
    return {
      temperature: externalTemperature ?? null,
      usedStrategy: RoomTemperatureStrategy.external,
      trvTemperatures,
    };
  }

  private createCalculatedRoomTemperatureResult(
    trvTemperatures: (number | undefined)[],
  ): RoomTemperatureResult {
    const effectiveStrategy =
      this.roomTemperatureStrategy === RoomTemperatureStrategy.external
        ? RoomTemperatureStrategy.average_trv
        : this.roomTemperatureStrategy;

    const validTrvTemperatures = this.getValidTemperatures(trvTemperatures);

    if (validTrvTemperatures.length === 0) {
      return {
        temperature: null,
        usedStrategy: null,
        trvTemperatures,
      };
    }

    return {
      temperature:
        effectiveStrategy === RoomTemperatureStrategy.average_trv
          ? this.calculateAverageTemperature(validTrvTemperatures)
          : this.calculateMedianTemperature(validTrvTemperatures),
      usedStrategy: effectiveStrategy,
      trvTemperatures,
    };
  }

  private getValidTemperatures(temperatures: (number | undefined)[]): number[] {
    return temperatures.filter((temp): temp is number => temp !== undefined);
  }

  private calculateAverageTemperature(temperatures: number[]): number {
    return (
      temperatures.reduce((sum, value) => sum + value, 0) / temperatures.length
    );
  }

  private calculateMedianTemperature(temperatures: number[]): number {
    const sorted = temperatures.slice().sort((a, b) => a - b);

    const middle = Math.floor(sorted.length / 2);

    return sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];
  }

  public createInput(targetTempC: number): RoomMpcInput | null {
    const roomTemperature = this.getRoomTemperature();

    if (roomTemperature.temperature === null) {
      return null;
    }

    return {
      nowTs: Date.now(),
      targetTempC,
      roomTempC: roomTemperature.temperature,
      outdoorTempC: this.outdoorTemperatureSensor.getFreshValue(),
      flowTempC: this.flowTemperatureSensor.getFreshValue(),
      usedRoomSensorStrategy: roomTemperature.usedStrategy,
      trvTemperatures: roomTemperature.trvTemperatures,
    };
  }
}
