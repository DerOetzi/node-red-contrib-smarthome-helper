import {
  defaultMatcherRow,
  MatchJoinNodeConfig,
  MatchJoinNodeData,
  MatchJoinNodeEditorProperties,
  MatchJoinNodeMessage,
} from "../../flowctrl/match-join/types";
import { NodeColor, NodeType } from "../../types";
import { LightCommand } from "../light-controller/types";
import { helperCategory } from "../types";

export enum MotionControllerCommand {
  block = "block",
  unblock = "unblock",
}

export interface MotionControllerNodeConfig extends MatchJoinNodeConfig {
  statusDelay: number;
  timer: number;
  timerUnit: string;
  onlyDarkness: boolean;
  nightmodeEnabled: boolean;
  onCommand: string;
  offCommand: string;
  nightmodeCommand: string;
}

export const defaultMotionControllerNodeConfig: Partial<MotionControllerNodeConfig> =
  {
    matchers: [
      {
        ...defaultMatcherRow,
        target: "motion",
        targetType: "str",
      },
      {
        ...defaultMatcherRow,
        property: "command",
        operator: "not_empty",
        target: "command",
        targetType: "str",
      },
      {
        ...defaultMatcherRow,
        target: "manual_control",
        targetType: "str",
      },
    ],
    statusDelay: 100,
    timer: 30,
    timerUnit: "s",
    join: false,
    minMsgCount: 1,
    discardNotMatched: true,
    outputs: 2,
    nightmodeEnabled: false,
    onlyDarkness: false,
    onCommand: LightCommand.On,
    offCommand: LightCommand.Off,
    nightmodeCommand: LightCommand.Nightmode,
  };

export interface MotionControllerNodeEditorProperties
  extends MatchJoinNodeEditorProperties {
  statusDelay: number;
  timer: number;
  timerUnit: string;
  nightmodeEnabled: boolean;
  onlyDarkness: boolean;
  onCommand: string;
  offCommand: string;
  nightmodeCommand: string;
}

export interface MotionControllerNodeMessage extends MatchJoinNodeMessage {
  originalTopic: string;
  command?: MotionControllerCommand;
  action?: LightCommand;
}

export interface MotionControllerNodeData extends MatchJoinNodeData {
  msg: MotionControllerNodeMessage;
}

export const MotionControllerNodeType = new NodeType(
  helperCategory,
  "motion-controller",
  NodeColor.Switch
);
