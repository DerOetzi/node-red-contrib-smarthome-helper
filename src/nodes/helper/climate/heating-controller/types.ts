import {
  BaseEditorNodePropertiesDefaults,
  BaseNodeOptionsDefaults,
} from "@base/types";
import { TimeIntervalUnit } from "@helpers/time.helper";
import { NotApplicableCompareFunction } from "@logical/compare/types";
import {
  MatcherRowDefaults,
  MatchJoinEditorNodeProperties,
  MatchJoinNodeData,
  MatchJoinNodeDef,
  MatchJoinNodeMessage,
  MatchJoinNodeOptions,
} from "@match-join/types";
import { EditorNodePropertiesDef } from "node-red";

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
  comfortCommand?: string;
  ecoCommand?: string;
  boostCommand?: string;
  frostProtectionCommand?: string;
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
    outputs: 4,
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

export const HeatingControllerEditorNodePropertiesDefaults: EditorNodePropertiesDef<HeatingControllerEditorNodeProperties> =
  {
    ...BaseEditorNodePropertiesDefaults,
    matchers: {
      value: HeatingControllerNodeOptionsDefaults.matchers,
      required: true,
    },
    discardNotMatched: {
      value: HeatingControllerNodeOptionsDefaults.discardNotMatched,
      required: true,
    },
    join: {
      value: HeatingControllerNodeOptionsDefaults.join,
      required: true,
    },
    minMsgCount: {
      value: HeatingControllerNodeOptionsDefaults.minMsgCount,
      required: true,
    },
    outputs: {
      value: HeatingControllerNodeOptionsDefaults.outputs,
      required: true,
    },
    reactivateEnabled: {
      value: HeatingControllerNodeOptionsDefaults.reactivateEnabled,
      required: true,
    },
    pause: {
      value: HeatingControllerNodeOptionsDefaults.pause,
      required: true,
    },
    pauseUnit: {
      value: HeatingControllerNodeOptionsDefaults.pauseUnit,
      required: true,
    },
    defaultActive: {
      value: HeatingControllerNodeOptionsDefaults.defaultActive,
      required: true,
    },
    boostEnabled: {
      value: HeatingControllerNodeOptionsDefaults.boostEnabled,
      required: true,
    },
    boostTemperatureOffset: {
      value: HeatingControllerNodeOptionsDefaults.boostTemperatureOffset,
      required: true,
    },
    frostProtectionTemperature: {
      value: HeatingControllerNodeOptionsDefaults.frostProtectionTemperature,
      required: true,
    },
    pvBoostEnabled: {
      value: HeatingControllerNodeOptionsDefaults.pvBoostEnabled,
      required: true,
    },
    pvBoostTemperatureOffset: {
      value: HeatingControllerNodeOptionsDefaults.pvBoostTemperatureOffset,
      required: true,
    },
    comfortCommand: {
      value: HeatingControllerNodeOptionsDefaults.comfortCommand,
      required: true,
    },
    ecoCommand: {
      value: HeatingControllerNodeOptionsDefaults.ecoCommand,
      required: true,
    },
    boostCommand: {
      value: HeatingControllerNodeOptionsDefaults.boostCommand,
      required: true,
    },
    frostProtectionCommand: {
      value: HeatingControllerNodeOptionsDefaults.frostProtectionCommand,
      required: true,
    },
    statusDelay: {
      value: "",
      required: false,
    },
  };

export interface HeatingControllerNodeMessage extends MatchJoinNodeMessage {
  command?: HeatingControllerCommand;
}

export interface HeatingControllerNodeData extends MatchJoinNodeData {
  msg: HeatingControllerNodeMessage;
}
