import { clamp } from "../../../../../helpers/math.helper";
import { convertToMilliseconds } from "../../../../../helpers/time.helper";
import { RoomDistributionModel, RoomThermalModel } from "./model";
import { RoomMPCSensors } from "./sensors";
import {
  HeatingMPCControllerNodeOptions,
  RoomMpcInput,
  RoomMpcResult,
  TrvIndex,
} from "./types";

export class RoomMPCController {
  private readonly sensors: RoomMPCSensors;
  private readonly thermalModel: RoomThermalModel;
  private readonly distributionModel: RoomDistributionModel;
  private readonly config: HeatingMPCControllerNodeOptions;

  private readonly holdTimeMs: number;

  private lastDemandPct = 0;
  private lastDemandUpdateTs = 0;

  constructor(config: HeatingMPCControllerNodeOptions) {
    this.config = config;

    this.sensors = new RoomMPCSensors(config);
    this.thermalModel = new RoomThermalModel(config);
    this.distributionModel = new RoomDistributionModel(config);

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

    const requestedDemandPct = this.calculateRequestedDemandPct(
      input,
      availableHeatingPowerW,
    );

    const stabilizedDemandPct = this.stabilizeDemand(requestedDemandPct);

    return this.createResult(
      input,
      stabilizedDemandPct,
      availableHeatingPowerW,
    );
  }

  private calculateRequestedDemandPct(
    input: RoomMpcInput,
    availableHeatingPowerW: number,
  ): number {
    const requestedHeatingPower = this.calculateRequestedHeatingPower(
      input,
      availableHeatingPowerW,
    );

    const limitedHeatingPower = clamp(
      requestedHeatingPower,
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
      this.getOutdoorTemperature(input),
    );

    const catchupPower = this.thermalModel.calculateCatchupPower(
      input.targetTempC,
      input.roomTempC,
      availableHeatingPowerW,
    );

    return baseHeatingPower + catchupPower;
  }

  private getOutdoorTemperature(input: RoomMpcInput): number {
    return input.outdoorTempC ?? this.config.designOutdoorTemperatureC;
  }

  private createResult(
    input: RoomMpcInput,
    stabilizedDemandPct: number,
    availableHeatingPowerW: number,
  ): RoomMpcResult {
    const requestedHeatingPowerW =
      (stabilizedDemandPct / 100) * availableHeatingPowerW;

    return {
      trvTargets: this.distributionModel.distributeDemand(stabilizedDemandPct),
      roomTemperature: input.roomTempC,
      demandPct: stabilizedDemandPct,
      requestedHeatingPowerW,
      availableHeatingPowerW,
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
}
