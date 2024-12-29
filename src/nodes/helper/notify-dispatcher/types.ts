import {
  defaultMatcherRow,
  MatchJoinNodeConfig,
  MatchJoinNodeData,
  MatchJoinNodeEditorProperties,
  MatchJoinNodeMessage,
} from "../../flowctrl/match-join/types";
import { NodeColor, NodeType } from "../../types";
import { helperCategory } from "../types";

export interface NotifyDispatcherNodeConfig extends MatchJoinNodeConfig {}

export interface NotifyMessage {
  title: string;
  message: string;
  onlyAtHome?: boolean;
}

export const defaultNotifyDispatcherNodeConfig: Partial<NotifyDispatcherNodeConfig> =
  {
    matchers: [{ ...defaultMatcherRow, target: "person1", targetType: "str" }],
    join: true,
    minMsgCount: 2,
    discardNotMatched: true,
    outputs: 2,
  };

export interface NotifyDispatcherNodeEditorProperties
  extends MatchJoinNodeEditorProperties {}

export interface NotifyDispatcherNodeMessage extends MatchJoinNodeMessage {
  originalTopic: string;
  notify: NotifyMessage;
}

export interface NotifyDispatcherNodeData extends MatchJoinNodeData {
  msg: NotifyDispatcherNodeMessage;
}

export const NotifyDispatcherNodeType = new NodeType(
  helperCategory,
  "notify-dispatcher",
  NodeColor.Base
);
