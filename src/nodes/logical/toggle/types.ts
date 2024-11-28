import { NodeColor, NodeType } from "../../types";
import { SwitchNodeConfig, SwitchNodeEditorProperties } from "../switch/types";
import { logicalCategory } from "../types";

export interface ToggleNodeConfig extends SwitchNodeConfig {}

export const defaultToggleNodeConfig: Partial<ToggleNodeConfig> = {
    target: "payload",
    trueValue: "true",
    trueType: "bool",
    falseValue: "false",
    falseType: "bool",
    seperatedOutputs: false,
    outputs: 1,
};

export interface ToggleNodeEditorProperties
  extends SwitchNodeEditorProperties {}

export const ToggleNodeType = new NodeType(
  logicalCategory,
  "toggle",
  NodeColor.Logical
);
