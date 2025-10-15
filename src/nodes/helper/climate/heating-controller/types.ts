import { NodeMessage } from "node-red";
import { TimeIntervalUnit } from "../../../../helpers/time.helper";
import { BaseNodeOptionsDefaults } from "../../../flowctrl/base/types";
import {
  MatcherRowDefaults,
  MatchJoinEditorNodeProperties,
  MatchJoinNodeDef,
  MatchJoinNodeOptions,
} from "../../../flowctrl/match-join/types";
import { NotApplicableCompareFunction } from "../../../logical/compare/types";

export enum HeatMode {
  comfort = "comfort",
  eco = "eco",
  boost = "boost",
  frostProtection = "frost protection",
}

export enum HeatingControllerCommand {
  block = "block",
  unblock = "unblock",
}

export enum HeatingControllerTarget {
  activeCondition = "activeCondition",
  comfortTemperature = "comfortTemperature",
  ecoTemperatureOffset = "ecoTemperatureOffset",
  pvBoost = "pvBoost",
  windowOpen = "windowOpen",
  manualControl = "manualControl",
  command = "command",
}

export interface HeatingControllerNodeOptions extends MatchJoinNodeOptions {
  reactivateEnabled: boolean;
  pause: number;
  pauseUnit: TimeIntervalUnit;
  defaultActive: boolean;
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
    ...BaseNodeOptionsDefaults,
    matchers: [
      {
        ...MatcherRowDefaults,
        target: HeatingControllerTarget.activeCondition,
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
        target: HeatingControllerTarget.manualControl,
        targetType: "str",
      },
      {
        ...MatcherRowDefaults,
        property: "command",
        operation: NotApplicableCompareFunction.notEmpty,
        target: HeatingControllerTarget.command,
        targetType: "str",
      },
    ],
    join: false,
    discardNotMatched: true,
    minMsgCount: 1,
    outputs: 3,
    reactivateEnabled: true,
    pause: 1,
    pauseUnit: TimeIntervalUnit.h,
    defaultActive: false,
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
  extends MatchJoinNodeDef,
    HeatingControllerNodeOptions {}

export interface HeatingControllerEditorNodeProperties
  extends MatchJoinEditorNodeProperties,
    HeatingControllerNodeOptions {}

export interface HeatingControllerNodeMessage extends NodeMessage {
  command?: HeatingControllerCommand;
  heatmode?: HeatMode;
}
