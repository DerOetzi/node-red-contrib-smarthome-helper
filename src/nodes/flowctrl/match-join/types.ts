import { BaseNodeConfig, BaseNodeEditorProperties } from "../base/types";

export interface MatcherRow {
  property: string;
  propertyType: any;
  operator: string;
  compare: string;
  compareType: string;
  target: string;
  targetType: string;
}

const defaultMatcherRow: MatcherRow = {
  property: "topic",
  propertyType: "msg",
  operator: "eq",
  compare: "",
  compareType: "str",
  target: "",
  targetType: "str",
};

export interface MatchJoinNodeConfig extends BaseNodeConfig {
  matchers: MatcherRow[];
  minMsgCount: number;
}

export const defaultMatchJoinNodeConfig: Partial<MatchJoinNodeConfig> = {
  matchers: [defaultMatcherRow],
  minMsgCount: 1,
};

export interface MatchJoinNodeEditorProperties
  extends BaseNodeEditorProperties {
  matchers: MatcherRow[];
  minMsgCount: number;
}
