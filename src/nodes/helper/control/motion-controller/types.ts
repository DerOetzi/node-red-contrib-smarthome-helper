import { EditorNodePropertiesDef, NodeMessage } from "node-red";

import { TimeIntervalUnit } from "../../../../helpers/time.helper";
import {
  BaseEditorNodePropertiesDefaults,
  BaseNodeOptionsDefaults,
} from "../../../flowctrl/base/types";
import {
  MatcherRowDefaults,
  MatchJoinEditorNodeProperties,
  MatchJoinNodeDef,
  MatchJoinNodeOptions,
} from "../../../flowctrl/match-join/types";
import { NotApplicableCompareFunction } from "../../../logical/compare/types";
import { LightCommand } from "../../light/light-controller/types";

export enum MotionControllerCommand {
  block = "block",
  unblock = "unblock",
}

export enum MotionControllerTarget {
  motion = "motion",
  darkness = "darkness",
  night = "night",
  manualControl = "manualControl",
  command = "command",
}

export interface MotionControllerNodeOptions extends MatchJoinNodeOptions {
  timer: number;
  timerUnit: TimeIntervalUnit;
  onlyDarkness: boolean;
  nightmodeEnabled: boolean;
  onCommand?: string;
  offCommand?: string;
  nightmodeCommand?: string;

  //deprecated since 0.21.3
  statusDelay?: number;
}

export const MotionControllerNodeOptionsDefaults: MotionControllerNodeOptions =
  {
    ...BaseNodeOptionsDefaults,
    matchers: [
      {
        ...MatcherRowDefaults,
        target: "motion",
        targetType: "str",
      },
      {
        ...MatcherRowDefaults,
        property: "command",
        operation: NotApplicableCompareFunction.notEmpty,
        target: "command",
        targetType: "str",
      },
      {
        ...MatcherRowDefaults,
        target: "manualControl",
        targetType: "str",
      },
    ],
    join: false,
    discardNotMatched: true,
    minMsgCount: 1,
    timer: 30,
    timerUnit: TimeIntervalUnit.s,
    nightmodeEnabled: false,
    onlyDarkness: false,
    onCommand: "",
    offCommand: "",
    nightmodeCommand: "",
  };

export interface MotionControllerNodeDef
  extends MatchJoinNodeDef,
    MotionControllerNodeOptions {}

export interface MotionControllerEditorNodeProperties
  extends MatchJoinEditorNodeProperties,
    MotionControllerNodeOptions {}

export const MotionControllerEditorNodePropertiesDefaults: EditorNodePropertiesDef<MotionControllerEditorNodeProperties> =
  {
    ...BaseEditorNodePropertiesDefaults,
    matchers: {
      value: MotionControllerNodeOptionsDefaults.matchers,
      required: true,
    },
    discardNotMatched: {
      value: MotionControllerNodeOptionsDefaults.discardNotMatched,
      required: true,
    },
    join: {
      value: MotionControllerNodeOptionsDefaults.join,
      required: true,
    },
    minMsgCount: {
      value: MotionControllerNodeOptionsDefaults.minMsgCount,
      required: true,
    },
    timer: {
      value: MotionControllerNodeOptionsDefaults.timer,
      required: true,
    },
    timerUnit: {
      value: MotionControllerNodeOptionsDefaults.timerUnit,
      required: true,
    },
    nightmodeEnabled: {
      value: MotionControllerNodeOptionsDefaults.nightmodeEnabled,
      required: true,
    },
    onlyDarkness: {
      value: MotionControllerNodeOptionsDefaults.onlyDarkness,
      required: true,
    },
    onCommand: {
      value: MotionControllerNodeOptionsDefaults.onCommand,
      required: true,
    },
    offCommand: {
      value: MotionControllerNodeOptionsDefaults.offCommand,
      required: true,
    },
    nightmodeCommand: {
      value: MotionControllerNodeOptionsDefaults.nightmodeCommand,
      required: true,
    },
    statusDelay: {
      value: "",
      required: false,
    },
  };

export interface MotionControllerNodeMessage extends NodeMessage {
  command?: MotionControllerCommand;
  action?: LightCommand;
}
