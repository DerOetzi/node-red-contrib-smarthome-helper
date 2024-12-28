import { NodeColor, NodeType } from "../../types";
import {
  defaultMatcherRow,
  MatchJoinNodeConfig,
  MatchJoinNodeEditorProperties,
} from "../../flowctrl/match-join/types";
import { operatorCategory } from "../types";

export interface AdditionalValueRow {
  value: string;
  valueType: string;
}

export interface ArithmeticNodeConfig extends MatchJoinNodeConfig {
  operation: string;
  minValueCount: number;
  precision: number;
  additionalValues?: AdditionalValueRow[];
}

export const defaultArithmeticNodeConfig: Partial<ArithmeticNodeConfig> = {
  matchers: [{ ...defaultMatcherRow, target: "value", targetType: "str" }],
  operation: "add",
  precision: 0,
  join: false,
  minMsgCount: 1,
  minValueCount: 1,
  discardNotMatched: true,
  additionalValues: [],
};

export interface ArithmeticNodeEditorProperties
  extends MatchJoinNodeEditorProperties {
  operation: string;
  minValueCount: number;
  precision: number;
  additionalValues: AdditionalValueRow[];
}

export const ArithmeticNodeType = new NodeType(
  operatorCategory,
  "arithmetic",
  NodeColor.Base
);
