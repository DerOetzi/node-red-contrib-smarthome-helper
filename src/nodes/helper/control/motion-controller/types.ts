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

export interface MotionControllerNodeMessage extends NodeMessage {
  command?: MotionControllerCommand;
  action?: LightCommand;
}
