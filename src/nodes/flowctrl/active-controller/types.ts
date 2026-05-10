import { NodeMessage } from "node-red";
import { TimeIntervalUnit } from "../../../helpers/time.helper";
import {
  InputNodeOptionsDefaults,
  MatcherRowDefaults,
  MatchJoinEditorNodeProperties,
  MatchJoinNodeDef,
  MatchJoinNodeOptions,
} from "../match-join/types";

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
    ...InputNodeOptionsDefaults,
    matchers: [
      {
        ...MatcherRowDefaults,
        target: ActiveControllerTarget.activeCondition,
        targetType: "str",
      },
    ],
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
