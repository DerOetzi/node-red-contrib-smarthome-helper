import { NodeColor, NodeType } from "../../types";
import {
  BaseNodeConfig,
  BaseNodeEditorProperties,
} from "../../flowctrl/base/types";
import { logicalCategory } from "../types";

export interface SwitchNodeConfig extends BaseNodeConfig {}

export const defaultSwitchNodeConfig: Partial<SwitchNodeConfig> = {};

export interface SwitchNodeEditorProperties extends BaseNodeEditorProperties {}

export const SwitchNodeType = new NodeType(
  logicalCategory,
  "switch",
  NodeColor.Logical
);
