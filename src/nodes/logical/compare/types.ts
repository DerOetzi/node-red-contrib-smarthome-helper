import { NodeColor, NodeType } from "../../types";
import { SwitchNodeConfig, SwitchNodeEditorProperties } from "../switch/types";
import { logicalCategory } from "../types";

export interface CompareNodeConfig extends SwitchNodeConfig {
  property: string;
  propertyType: string;
  operator: string;
  value: string;
  valueType: string;
}

export const defaultCompareNodeConfig: Partial<CompareNodeConfig> = {
  property: "payload",
  propertyType: "msg",
  operator: "eq",
  value: "",
  valueType: "str",
  target: "payload",
  trueValue: "true",
  trueType: "bool",
  falseValue: "false",
  falseType: "bool",
  seperatedOutputs: false,
  outputs: 1,
};

export interface CompareNodeEditorProperties
  extends SwitchNodeEditorProperties {
  property: string;
  propertyType: string;
  operator: string;
  value: string;
  valueType: string;
}

export const CompareNodeType = new NodeType(
  logicalCategory,
  "compare",
  NodeColor.Logical
);
