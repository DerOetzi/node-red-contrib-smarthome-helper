import { NodeColor, NodeType } from "../../types";
import { BaseNodeConfig, BaseNodeEditorProperties } from "../base/types";
import { flowctrlCategory } from "../types";

export interface MatcherRow {
  property: string;
  propertyType: any;
  operator: string;
  compare: string;
  compareType: string;
  target: string;
  targetType: string;
}

export const defaultMatcherRow: MatcherRow = {
  property: "topic",
  propertyType: "msg",
  operator: "eq",
  compare: "",
  compareType: "str",
  target: "topic",
  targetType: "msg",
};

export interface MatchJoinNodeConfig extends BaseNodeConfig {
  join: boolean;
  discardNotMatched: boolean;
  matchers: MatcherRow[];
  minMsgCount: number;
}

export const defaultMatchJoinNodeConfig: Partial<MatchJoinNodeConfig> = {
  join: false,
  discardNotMatched: true,
  matchers: [defaultMatcherRow],
  minMsgCount: 1,
};

export interface MatchJoinNodeEditorProperties
  extends BaseNodeEditorProperties {
  join: boolean;
  discardNotMatched: boolean;
  matchers: MatcherRow[];
  minMsgCount: number;
}

export const MatchJoinNodeType = new NodeType(
  flowctrlCategory,
  "match-join",
  NodeColor.Base
);
