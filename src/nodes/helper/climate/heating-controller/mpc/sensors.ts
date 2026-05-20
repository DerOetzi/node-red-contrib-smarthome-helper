import {
  convertToMilliseconds,
  TimeIntervalUnit,
} from "../../../../../helpers/time.helper";
import {
  SENSOR_OUTLIER_DRIFT_MAX_INTERVAL_M,
  SENSOR_OUTLIER_DRIFT_MATCH_DELTA_C,
  SENSOR_OUTLIER_DRIFT_REPEAT_COUNT,
  SENSOR_OUTLIER_MAX_DELTA_C,
  SENSOR_OUTLIER_MIN_SAMPLES,
  SENSOR_OUTLIER_WINDOW_SIZE,
  TRV_MAX_COUNT,
} from "./const";
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
  private readonly _outlierFilterEnabled: boolean;
  private readonly _acceptedValues: number[] = [];
  private _pendingOutlierValue?: number;
  private _pendingOutlierCount = 0;
  private _pendingOutlierLastTs = 0;

  constructor(maxAgeMs: number, outlierFilterEnabled: boolean) {
    this._maxAgeMs = maxAgeMs;
    this._outlierFilterEnabled = outlierFilterEnabled;
  }

  public set value(newValue: number | undefined) {
    if (this.shouldIgnoreValue(newValue)) {
      return;
    }

    this.storeValue(newValue);
  }

  public getFreshValue(nowTs: number = Date.now()): number | undefined {
    return this.isFresh(nowTs) ? this._value : undefined;
  }

  private isFresh(nowTs: number = Date.now()): boolean {
    if (this._value === undefined) {
      return false;
    }

    if (this._maxAgeMs <= 0) {
      return true;
    }

    return nowTs - this._timestamp <= this._maxAgeMs;
  }

  public get rawValue(): number | undefined {
    return this._value;
  }

  private shouldIgnoreValue(newValue: number | undefined): boolean {
    if (newValue === undefined) {
      return false;
    }

    if (this._value === undefined) {
      return false;
    }

    if (!this._isOutlier(newValue)) {
      return false;
    }

    if (this.shouldAcceptOutlierAsDrift(newValue, Date.now())) {
      return false;
    }

    return true;
  }

  private _isOutlier(newValue: number): boolean {
    if (!this._outlierFilterEnabled) {
      return false;
    }

    if (this._acceptedValues.length < SENSOR_OUTLIER_MIN_SAMPLES) {
      return false;
    }

    const baseline = this._calculateMedian(this._acceptedValues);

    return Math.abs(newValue - baseline) > SENSOR_OUTLIER_MAX_DELTA_C;
  }

  private _calculateMedian(values: number[]): number {
    const sorted = values.slice().sort((a, b) => a - b);

    const middle = Math.floor(sorted.length / 2);

    return sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];
  }

  private storeValue(newValue: number | undefined): void {
    this._value = newValue;

    if (newValue === undefined) {
      return;
    }

    this.resetOutlierDriftCandidate();

    this._timestamp = Date.now();
    this._acceptedValues.push(newValue);
    this.trimAcceptedValues();
  }

  private shouldAcceptOutlierAsDrift(newValue: number, nowTs: number): boolean {
    const candidateExpired =
      this._pendingOutlierLastTs > 0 &&
      nowTs - this._pendingOutlierLastTs >
        convertToMilliseconds(
          SENSOR_OUTLIER_DRIFT_MAX_INTERVAL_M,
          TimeIntervalUnit.m,
        );

    if (
      this._pendingOutlierValue === undefined ||
      candidateExpired ||
      Math.abs(newValue - this._pendingOutlierValue) >
        SENSOR_OUTLIER_DRIFT_MATCH_DELTA_C
    ) {
      this._pendingOutlierValue = newValue;
      this._pendingOutlierCount = 1;
      this._pendingOutlierLastTs = nowTs;
      return false;
    }

    this._pendingOutlierCount++;
    this._pendingOutlierLastTs = nowTs;

    const previousCount = this._pendingOutlierCount - 1;
    this._pendingOutlierValue =
      (this._pendingOutlierValue * previousCount + newValue) /
      this._pendingOutlierCount;

    return this._pendingOutlierCount >= SENSOR_OUTLIER_DRIFT_REPEAT_COUNT;
  }

  private resetOutlierDriftCandidate(): void {
    this._pendingOutlierValue = undefined;
    this._pendingOutlierCount = 0;
    this._pendingOutlierLastTs = 0;
  }

  private trimAcceptedValues(): void {
    if (this._acceptedValues.length <= SENSOR_OUTLIER_WINDOW_SIZE) {
      return;
    }

    this._acceptedValues.splice(
      0,
      this._acceptedValues.length - SENSOR_OUTLIER_WINDOW_SIZE,
    );
  }
}

export class ActorStateEntry extends SensorEntry {
  constructor(maxAgeMs: number) {
    super(maxAgeMs, false);
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
      this.trvTemperatures.push(new SensorEntry(maxSensorAgeMs, true));
    }

    this.additionalTemperatureSensor = new SensorEntry(maxSensorAgeMs, true);

    this.outdoorTemperatureSensor = new SensorEntry(maxSensorAgeMs, true);

    this.flowTemperatureSensor = new SensorEntry(maxSensorAgeMs, true);
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
    const outdoorTempC = this.outdoorTemperatureSensor.getFreshValue();

    if (roomTemperature.temperature === null || outdoorTempC === undefined) {
      return null;
    }

    return {
      nowTs: Date.now(),
      targetTempC,
      roomTempC: roomTemperature.temperature,
      outdoorTempC: outdoorTempC,
      flowTempC: this.flowTemperatureSensor.getFreshValue(),
      usedRoomSensorStrategy: roomTemperature.usedStrategy,
      trvTemperatures: roomTemperature.trvTemperatures,
    };
  }
}
