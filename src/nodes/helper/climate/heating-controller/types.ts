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

export enum HeatingControllerTarget {
  comfortCondition = "comfortCondition",
  comfortTemperature = "comfortTemperature",
  ecoTemperatureOffset = "ecoTemperatureOffset",
  pvBoost = "pvBoost",
  windowOpen = "windowOpen",
}

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
  };

export interface HeatingControllerNodeDef
  extends ActiveControllerNodeDef, HeatingControllerNodeOptions {}

export interface HeatingControllerEditorNodeProperties
  extends ActiveControllerEditorNodeProperties, HeatingControllerNodeOptions {}

export interface HeatingControllerNodeMessage extends ActiveControllerNodeMessage {
  heatmode?: HeatMode;
}
