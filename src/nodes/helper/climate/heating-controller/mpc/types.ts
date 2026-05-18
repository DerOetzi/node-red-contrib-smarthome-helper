import { TimeIntervalUnit } from "../../../../../helpers/time.helper";

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

export type RoomMpcResult = {
  trvTargets: number[];
  roomTemperature: number;
  demandPct: number;
  requestedHeatingPowerW: number;
  availableHeatingPowerW: number;
  input: RoomMpcInput;
  learningState?: RoomModelLearningState | null;
};

export type LearningFactors = {
  uaFactor: number;
  capacityFactor: number;
};

export type RoomModelLearningState = {
  learnedFactors: LearningFactors;
  predictionErrorC?: number;
};

export type RoomModelPrediction = {
  predictedTempC: number;
  actualTempC: number;

  predictedDeltaC: number;
  actualDeltaC: number;

  modelErrorC: number;

  timestamp: number;
};

export type TrvIndex = 0 | 1 | 2;
