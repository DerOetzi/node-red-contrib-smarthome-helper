import { TimeIntervalUnit } from "../../../../../helpers/time.helper";

export enum RoomTemperatureStrategy {
  external = "external",
  average_trv = "average_trv",
  median_trv = "median_trv",
}
export enum HeatEmitterType {
  panel = "panel",
  towel = "towel",
}

export enum PanelRadiatorType {
  type10 = "10",
  type11 = "11",
  type21 = "21",
  type22 = "22",
  type33 = "33",
}

export enum DesignTemperatureSystem {
  system_75_65 = "system_75_65",
  system_70_55 = "system_70_55",
  system_55_45 = "system_55_45",
  system_45_35 = "system_45_35",
  system_35_30 = "system_35_30",
}

export interface TrvRow {
  name: string;

  emitterType: HeatEmitterType;

  minTargetTemperature: number;
  maxTargetTemperature: number;
  targetTemperatureStep: number;

  //Panel radiator properties
  radiatorType?: PanelRadiatorType;
  widthMm?: number;
  heightMm?: number;

  //Towel radiator properties
  nominalPowerW?: number;

  //Deprecated since 1.2.16
  radiatorPowerW?: number;
}

export const TrvRowDefaults: TrvRow = {
  name: "",

  minTargetTemperature: 5,
  maxTargetTemperature: 30,
  targetTemperatureStep: 0.5,

  emitterType: HeatEmitterType.panel,
  radiatorType: PanelRadiatorType.type22,
  widthMm: 1000,
  heightMm: 600,

  nominalPowerW: 500,

  //Deprecated since 1.2.16
  radiatorPowerW: undefined,
};

export interface HeatingMPCControllerNodeOptions {
  designIndoorTemperatureC: number;
  designOutdoorTemperatureC: number;
  designTemperatureSystem: DesignTemperatureSystem;
  roomHeatLoadW: number;

  mpcLearningEnabledByDefault: boolean;

  mpcDemandHysteresisPct: number;
  mpcHoldTime: number;
  mpcHoldTimeUnit: TimeIntervalUnit;
  mpcHoldOverrideDemandPct: number;
  mpcMaxDemandStepPct: number;

  trvs: TrvRow[];

  roomTemperatureStrategy: RoomTemperatureStrategy;
  maxSensorAge: number;
  maxSensorAgeUnit: TimeIntervalUnit;

  //Deprecated since 1.2.17
  mpcReferenceFlowTemperature?: number;
  roomVolumeM3?: number;
  airChangeRate?: number;
  transmissionHeatLossExternalW?: number;
  ventilationHeatLossW?: number;

  minTargetTemperature?: number;
  maxTargetTemperature?: number;
  targetTemperatureStep?: number;
}

export const HeatingMPCControllerOptionsDefaults: HeatingMPCControllerNodeOptions =
  {
    designIndoorTemperatureC: 20,
    designOutdoorTemperatureC: -12,
    designTemperatureSystem: DesignTemperatureSystem.system_55_45,
    roomHeatLoadW: 1000,

    mpcLearningEnabledByDefault: false,

    mpcDemandHysteresisPct: 5,
    mpcHoldTime: 5,
    mpcHoldTimeUnit: TimeIntervalUnit.m,
    mpcHoldOverrideDemandPct: 40,
    mpcMaxDemandStepPct: 20,

    trvs: [
      {
        ...TrvRowDefaults,
        name: "trv1",
      },
    ],

    roomTemperatureStrategy: RoomTemperatureStrategy.external,
    maxSensorAge: 30,
    maxSensorAgeUnit: TimeIntervalUnit.m,

    mpcReferenceFlowTemperature: undefined,
    roomVolumeM3: undefined,
    airChangeRate: undefined,
    transmissionHeatLossExternalW: undefined,
    ventilationHeatLossW: undefined,
    minTargetTemperature: undefined,
    maxTargetTemperature: undefined,
    targetTemperatureStep: undefined,
  };

export enum LearningStatus {
  learned = "learned",
  disabled = "disabled",
  skipped = "skipped",
  suppressed = "suppressed",
  waitingInterval = "waiting_interval",
}

export type LearningFactors = {
  uaFactor: number;
  capacityFactor: number;
};

export class PersistedLearningFactors {
  private readonly _version: number;
  private readonly _uaFactor: number;
  private readonly _capacityFactor: number;

  constructor(factors: LearningFactors, version: number) {
    this._version = version;
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

export const TRV_MAX_COUNT = 3;
export type TrvIndex = 0 | 1 | 2;

export const PERSISTENCE_VERSION = 1;
