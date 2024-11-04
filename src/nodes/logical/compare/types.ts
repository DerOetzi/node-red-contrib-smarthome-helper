import {
  BaseNodeConfig,
  BaseNodeEditorProperties,
} from "../../flowctrl/base/types";
import { NodeColor, NodeType } from "../../types";
import { logicalCategory } from "../types";

export interface CompareNodeConfig extends BaseNodeConfig {
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
};

export interface CompareNodeEditorProperties extends BaseNodeEditorProperties {
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
