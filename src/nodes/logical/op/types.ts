import { NodeColor, NodeType } from "../../types";
import { SwitchNodeConfig, SwitchNodeEditorProperties } from "../switch/types";
import { logicalCategory } from "../types";

export interface LogicalOpNodeConfig extends SwitchNodeConfig {
  logical: string;
  minMsgCount: number;
}

export const defaultLogicalOpNodeConfig: Partial<LogicalOpNodeConfig> = {
  logical: "and",
  minMsgCount: 1,
  target: "payload",
  trueValue: "true",
  trueType: "bool",
  falseValue: "false",
  falseType: "bool",
  seperatedOutputs: false,
  outputs: 1,
};

export interface LogicalOpNodeEditorProperties
  extends SwitchNodeEditorProperties {
  logical: string;
  minMsgCount: number;
}

export const LogicalOpNodeType = new NodeType(
  logicalCategory,
  "op",
  NodeColor.Logical
);
