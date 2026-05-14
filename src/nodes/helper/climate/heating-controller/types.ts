import {
  ActiveControllerEditorNodeProperties,
  ActiveControllerNodeDef,
  ActiveControllerNodeOptions,
  ActiveControllerNodeOptionsDefaults,
  ActiveControllerTarget,
  ActiveControllerNodeMessage,
} from "../../../flowctrl/active-controller/types";
import { MatcherRowDefaults } from "../../../flowctrl/match-join/types";
import { NotApplicableCompareFunction } from "../../../logical/compare/types";

export enum HeatMode {
  comfort = "comfort",
  eco = "eco",
  boost = "boost",
  frostProtection = "frost protection",
}

export enum HeatingControllerControllerMode {
  static = "static",
  mpc = "mpc",
}

export const TRV_MAX_COUNT = 3;

export interface TrvRow {
  name: string;
  powerFactor: number;
}

export const TrvRowDefaults: TrvRow = {
  name: "",
  powerFactor: 1,
};

export enum HeatingControllerTarget {
  comfortCondition = "comfortCondition",
  comfortTemperature = "comfortTemperature",
  ecoTemperatureOffset = "ecoTemperatureOffset",
  pvBoost = "pvBoost",
  windowOpen = "windowOpen",
  trv1 = "trv1",
  trv2 = "trv2",
  trv3 = "trv3",
  additionalTemperatureSensor = "additionalTemperatureSensor",
  outdoorTemperature = "outdoorTemperature",
  flowTemperature = "flowTemperature",
}

export type RoomMpcInput = {
  targetTempC: number;
  roomTempC: number;
  outdoorTempC?: number;
  flowTempC?: number;
  nowTs: number;
};

export type RoomMpcParams = {
  stepMinutes: number;
  horizonSteps: number;
  thermalGain: number;
  lossCoeff: number;
  changePenalty: number;
  demandHysteresisPct: number;
  holdTimeSeconds: number;
  maxDemandStepPct: number;
  referenceFlowTemperature: number;
  minFlowFactor: number;
  maxFlowFactor: number;
};

export type RoomMpcState = {
  lastPercent?: number;
  lastUpdateTs?: number;
  lastBaseTargetTemperature?: number;
  lastRoomTemperature?: number;
  lastCost?: number;
  lastFlowFactor?: number;
  lastTrvTargets?: Record<string, number>;

  lastRawDemandPct?: number;

  lastStabilizedDemandPct?: number;
};

export interface HeatingControllerNodeOptions extends ActiveControllerNodeOptions {
  defaultComfort: boolean;
  boostEnabled: boolean;
  boostTemperatureOffset: number;
  frostProtectionTemperature: number;
  comfortCommand: string;
  ecoCommand: string;
  boostCommand: string;
  frostProtectionCommand: string;
  pvBoostEnabled: boolean;
  pvBoostTemperatureOffset: number;

  controllerMode: HeatingControllerControllerMode;
  mpcStepMinutes: number;
  mpcHorizonSteps: number;
  mpcThermalGain: number;
  mpcLossCoeff: number;
  mpcChangePenalty: number;
  mpcDemandHysteresisPct: number;
  mpcHoldTimeSeconds: number;
  mpcMaxDemandStepPct: number;
  mpcReferenceFlowTemperature: number;
  mpcMinFlowFactor: number;
  mpcMaxFlowFactor: number;
  minTargetTemperature: number;
  maxTargetTemperature: number;
  targetTemperatureStep: number;
  trvs: TrvRow[];

  // deprecated 0.21.4
  statusDelay?: number;
}

export const HeatingControllerNodeOptionsDefaults: HeatingControllerNodeOptions =
  {
    ...ActiveControllerNodeOptionsDefaults,
    matchers: [
      {
        ...MatcherRowDefaults,
        target: HeatingControllerTarget.comfortCondition,
        targetType: "str",
      },
      {
        ...MatcherRowDefaults,
        target: HeatingControllerTarget.comfortTemperature,
        targetType: "str",
      },
      {
        ...MatcherRowDefaults,
        target: HeatingControllerTarget.ecoTemperatureOffset,
        targetType: "str",
      },
      {
        ...MatcherRowDefaults,
        target: HeatingControllerTarget.windowOpen,
        targetType: "str",
      },
      {
        ...MatcherRowDefaults,
        target: ActiveControllerTarget.manualControl,
        targetType: "str",
      },
      {
        ...MatcherRowDefaults,
        property: "command",
        operation: NotApplicableCompareFunction.notEmpty,
        target: ActiveControllerTarget.command,
        targetType: "str",
      },
    ],
    outputs: 3,
    defaultComfort: false,
    boostEnabled: false,
    boostTemperatureOffset: 5,
    frostProtectionTemperature: 8,
    comfortCommand: "",
    ecoCommand: "",
    boostCommand: "",
    frostProtectionCommand: "",
    pvBoostEnabled: false,
    pvBoostTemperatureOffset: 1,

    controllerMode: HeatingControllerControllerMode.static,
    mpcStepMinutes: 5,
    mpcHorizonSteps: 6,
    mpcThermalGain: 0.06,
    mpcLossCoeff: 0.01,
    mpcChangePenalty: 0.05,
    mpcDemandHysteresisPct: 5,
    mpcHoldTimeSeconds: 300,
    mpcMaxDemandStepPct: 20,
    mpcReferenceFlowTemperature: 50,
    mpcMinFlowFactor: 0.5,
    mpcMaxFlowFactor: 1.5,
    minTargetTemperature: 5,
    maxTargetTemperature: 30,
    targetTemperatureStep: 1,
    trvs: [],
  };

export interface HeatingControllerNodeDef
  extends ActiveControllerNodeDef, HeatingControllerNodeOptions {}

export interface HeatingControllerEditorNodeProperties
  extends ActiveControllerEditorNodeProperties, HeatingControllerNodeOptions {}

export interface HeatingControllerNodeMessage extends ActiveControllerNodeMessage {
  heatmode?: HeatMode;
}
