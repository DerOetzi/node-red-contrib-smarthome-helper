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
}

export const defaultSwitchNodeConfig: Partial<SwitchNodeConfig> = {
  target: "payload",
  trueValue: "payload",
  trueType: "msg",
  falseValue: "payload",
  falseType: "msg",
};

export interface SwitchNodeEditorProperties extends BaseNodeEditorProperties {
  target: string;
  trueValue: string;
  trueType: ValueType;
  falseValue: string;
  falseType: ValueType;
}

export const SwitchNodeType = new NodeType(
  logicalCategory,
  "switch",
  NodeColor.Logical
);
