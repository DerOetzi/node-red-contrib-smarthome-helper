import { TimeIntervalUnit } from "../../../../../helpers/time.helper";
import { PERSISTENCE_VERSION } from "./const";

export enum RoomTemperatureStrategy {
  external = "external",
  average_trv = "average_trv",
  median_trv = "median_trv",
}

export interface TrvRow {
  name: string;
  radiatorPowerW: number;
}

export const TrvRowDefaults: TrvRow = {
  name: "",
  radiatorPowerW: 1000,
};

export interface HeatingMPCControllerNodeOptions {
  designIndoorTemperatureC: number;
  designOutdoorTemperatureC: number;

  roomHeatLoadW: number;
  roomVolumeM3: number;
  airChangeRate: number;
  transmissionHeatLossExternalW: number;
  ventilationHeatLossW: number;

  mpcLearningEnabledByDefault: boolean;

  mpcReferenceFlowTemperature: number;

  mpcDemandHysteresisPct: number;
  mpcHoldTime: number;
  mpcHoldTimeUnit: TimeIntervalUnit;
  mpcHoldOverrideDemandPct: number;
  mpcMaxDemandStepPct: number;

  minTargetTemperature: number;
  maxTargetTemperature: number;
  targetTemperatureStep: number;

  trvs: TrvRow[];

  roomTemperatureStrategy: RoomTemperatureStrategy;
  maxSensorAge: number;
  maxSensorAgeUnit: TimeIntervalUnit;
}

export const HeatingMPCControllerOptionsDefaults: HeatingMPCControllerNodeOptions =
  {
    designIndoorTemperatureC: 20,
    designOutdoorTemperatureC: -12,

    roomHeatLoadW: 1200,
    roomVolumeM3: 50,
    airChangeRate: 0.5,
    transmissionHeatLossExternalW: 800,
    ventilationHeatLossW: 250,

    mpcLearningEnabledByDefault: false,

    mpcReferenceFlowTemperature: 50,

    mpcDemandHysteresisPct: 5,
    mpcHoldTime: 5,
    mpcHoldTimeUnit: TimeIntervalUnit.m,
    mpcHoldOverrideDemandPct: 40,
    mpcMaxDemandStepPct: 20,

    minTargetTemperature: 5,
    maxTargetTemperature: 30,
    targetTemperatureStep: 1,

    trvs: [
      {
        ...TrvRowDefaults,
        name: "trv1",
      },
    ],

    roomTemperatureStrategy: RoomTemperatureStrategy.external,
    maxSensorAge: 30,
    maxSensorAgeUnit: TimeIntervalUnit.m,
  };

export type RoomTemperatureResult = {
  temperature: number | null;
  usedStrategy: RoomTemperatureStrategy | null;
  trvTemperatures: (number | undefined)[];
};

export type RoomMpcInput = {
  nowTs: number;
  targetTempC: number;
  roomTempC: number;
  outdoorTempC: number;
  flowTempC?: number;
  usedRoomSensorStrategy: RoomTemperatureStrategy | null;
  trvTemperatures: (number | undefined)[];
};

export enum LearningStatus {
  initializing = "initializing",
  active = "active",
  disabled = "disabled",
  suppressed = "suppressed",
  waitingInterval = "waiting_interval",
  missingAppliedPower = "missing_applied_power",
}

export type LearningFactors = {
  uaFactor: number;
  capacityFactor: number;
};

export class PersistedLearningFactors {
  private readonly _version: number;
  private readonly _uaFactor: number;
  private readonly _capacityFactor: number;

  constructor(factors: LearningFactors) {
    this._version = PERSISTENCE_VERSION;
    this._uaFactor = factors.uaFactor;
    this._capacityFactor = factors.capacityFactor;
  }

  public get version(): number {
    return this._version;
  }

  public get uaFactor(): number {
    return this._uaFactor;
  }

  public get capacityFactor(): number {
    return this._capacityFactor;
  }

  public get factors(): LearningFactors {
    return {
      uaFactor: this._uaFactor,
      capacityFactor: this._capacityFactor,
    };
  }

  public toJson(): string {
    return JSON.stringify({
      version: this._version,
      uaFactor: this._uaFactor,
      capacityFactor: this._capacityFactor,
    });
  }
}

export type RoomModelPrediction = {
  predictedTempC: number;
  actualTempC: number;

  predictedDeltaC: number;
  actualDeltaC: number;

  modelErrorC: number;

  timestamp: number;
};

export type RoomModelLearningState = {
  status: LearningStatus;

  learnedFactors: LearningFactors;

  prediction?: RoomModelPrediction;

  appliedHeatingPowerW?: number;
};

export class RoomMpcResult {
  public static readonly REQUESTED_HEATING_POWER_ATTRIBUTE =
    "mpcRequestedHeatingPowerW";

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

export type TrvIndex = 0 | 1 | 2;
