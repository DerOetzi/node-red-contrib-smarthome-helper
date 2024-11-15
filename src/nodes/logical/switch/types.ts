import { NodeColor, NodeType } from "../../types";
import {
  BaseNodeConfig,
  BaseNodeEditorProperties,
} from "../../flowctrl/base/types";
import { logicalCategory } from "../types";

type ValueType = "msg" | "str" | "num";

export interface SwitchNodeConfig extends BaseNodeConfig {
  target: string;
  trueValue: string;
  trueType: ValueType;
  falseValue: string;
  falseType: ValueType;
  seperatedOutputs: boolean;
  outputs: number;
}

export const defaultSwitchNodeConfig: Partial<SwitchNodeConfig> = {
  target: "payload",
  trueValue: "payload",
  trueType: "msg",
  falseValue: "payload",
  falseType: "msg",
  seperatedOutputs: true,
  outputs: 2,
};

export interface SwitchNodeEditorProperties extends BaseNodeEditorProperties {
  target: string;
  trueValue: string;
  trueType: ValueType;
  falseValue: string;
  falseType: ValueType;
  seperatedOutputs: boolean;
  outputs: number;
}

export const SwitchNodeType = new NodeType(
  logicalCategory,
  "switch",
  NodeColor.Logical
);
