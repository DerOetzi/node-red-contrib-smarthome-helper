import { RoomModelLearningState, RoomTemperatureStrategy } from "./types";

export type RoomTemperatureResult =
  | {
      valid: true;
      input: {
        temperature: number;
        usedStrategy: RoomTemperatureStrategy;
        trvTemperatures: (number | undefined)[];
      };
    }
  | { valid: false; error: RoomMpcError };

export type RoomMpcInput = {
  nowTs: number;
  targetTempC: number;
  roomTempC: number;
  outdoorTempC: number;
  flowTempC?: number;
  usedRoomSensorStrategy: RoomTemperatureStrategy;
  trvTemperatures: (number | undefined)[];
};

export enum RoomMpcErrorCode {
  missingExternalTemperature = "missing_external_temperature",

  missingTrvTemperatures = "missing_trv_temperatures",

  missingOutdoorTemperature = "missing_outdoor_temperature",

  noHeatingPowerAvailable = "no_heating_power_available",
}

export const RoomMpcLogLevel: Record<
  RoomMpcErrorCode,
  "info" | "warn" | "error"
> = {
  [RoomMpcErrorCode.missingExternalTemperature]: "warn",

  [RoomMpcErrorCode.missingTrvTemperatures]: "warn",

  [RoomMpcErrorCode.missingOutdoorTemperature]: "warn",

  [RoomMpcErrorCode.noHeatingPowerAvailable]: "info",
};

export type RoomMpcError = {
  code: RoomMpcErrorCode;

  message: string;

  details?: Record<string, unknown>;
};

export type RoomMpcInputResult =
  | {
      valid: true;

      input: RoomMpcInput;
    }
  | {
      valid: false;

      error: RoomMpcError;
    };

export type RoomMpcComputeResult =
  | { valid: true; result: RoomMpcResult }
  | { valid: false; error: RoomMpcError };

export class RoomMpcResult {
  public static readonly REQUESTED_HEATING_POWER_ATTRIBUTE =
    "mpcOutRequestedHeatingPowerW";

  constructor(
    public trvTargets: number[],
    public input: RoomMpcInput,
    public demandPct: number,
    public requestedHeatingPowerW: number,
    public availableHeatingPowerW: number,
    public recommendedFlowTemperatureC: number | null,
    public learningState?: RoomModelLearningState,
  ) {}

  public getMpcAdditionalAttributes(): Record<string, unknown> {
    const attributes: Record<string, unknown> = {};
    Object.assign(attributes, this.getMpcInAttributes());
    Object.assign(attributes, this.getMpcOutAttributes());
    Object.assign(attributes, this.getMpcLearningAttributes());
    return attributes;
  }

  private getMpcInAttributes(): Record<string, unknown> {
    const attributes: Record<string, unknown> = {
      mpcInTargetTempC: this.input.targetTempC,
      mpcInRoomTempC: this.input.roomTempC,
      mpcInRoomSensorStrategy: this.input.usedRoomSensorStrategy,
      mpcInOutdoorTempC: this.input.outdoorTempC,
      mpcInFlowTempC: this.input.flowTempC,
    };

    this.input.trvTemperatures.forEach((trvTemp, index) => {
      attributes[`mpcInTrv${index + 1}TempC`] = trvTemp;
    });

    return attributes;
  }

  private getMpcOutAttributes(): Record<string, unknown> {
    const attributes: Record<string, unknown> = {
      mpcOutDemandPct: this.demandPct,
      [RoomMpcResult.REQUESTED_HEATING_POWER_ATTRIBUTE]:
        this.requestedHeatingPowerW,
      mpcOutAvailableHeatingPowerW: this.availableHeatingPowerW,
      mpcOutRecommendedFlowTemperatureC: this.recommendedFlowTemperatureC,
    };

    this.trvTargets.forEach((trvTarget, index) => {
      attributes[`mpcOutTrv${index + 1}TargetTempC`] = trvTarget;
    });

    return attributes;
  }

  private getMpcLearningAttributes(): Record<string, unknown> {
    if (!this.learningState) {
      return {};
    }

    return {
      mpcLearningStatus: this.learningState.status,
      mpcLearningUaFactor: this.learningState.learnedFactors.uaFactor,
      mpcLearningCapacityFactor:
        this.learningState.learnedFactors.capacityFactor,
      mpcLearningPrediction: this.learningState.prediction,
      mpcLearningAppliedHeatingPowerW: this.learningState.appliedHeatingPowerW,
    };
  }
}
