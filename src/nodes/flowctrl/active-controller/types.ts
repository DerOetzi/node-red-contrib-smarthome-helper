import { NodeMessage } from "node-red";
import { TimeIntervalUnit } from "../../../helpers/time.helper";
import {
  MatcherRowDefaults,
  MatchJoinEditorNodeProperties,
  MatchJoinNodeDef,
  MatchJoinNodeOptions,
} from "../match-join/types";
import { BaseNodeOptionsDefaults } from "../base/types";

export enum ActiveControllerCommand {
  block = "block",
  unblock = "unblock",
}

export enum ActiveControllerTarget {
  activeCondition = "activeCondition",
  command = "command",
  manualControl = "manualControl",
}

export interface ActiveControllerNodeOptions extends MatchJoinNodeOptions {
  defaultActive: boolean;
  reactivateEnabled: boolean;
  pause: number;
  pauseUnit: TimeIntervalUnit;
}

export const ActiveControllerNodeOptionsDefaults: ActiveControllerNodeOptions =
  {
    ...BaseNodeOptionsDefaults,
    matchers: [
      {
        ...MatcherRowDefaults,
        target: ActiveControllerTarget.activeCondition,
        targetType: "str",
      },
    ],
    join: false,
    discardNotMatched: true,
    minMsgCount: 1,
    defaultActive: true,
    reactivateEnabled: true,
    pause: 1,
    pauseUnit: TimeIntervalUnit.h,
  };

export interface ActiveControllerNodeDef
  extends MatchJoinNodeDef, ActiveControllerNodeOptions {}

export interface ActiveControllerEditorNodeProperties
  extends MatchJoinEditorNodeProperties, ActiveControllerNodeOptions {}

export interface ActiveControllerNodeMessage extends NodeMessage {
  command?: ActiveControllerCommand;
}
