import { EditorNodePropertiesDef } from "node-red";
import {
  SwitchEditorNodeProperties,
  SwitchEditorNodePropertiesDefaults,
  SwitchNodeDef,
  SwitchNodeOptions,
  SwitchNodeOptionsDefaults,
} from "../switch/types";

export enum ApplicableCompareFunction {
  eq = "eq",
  neq = "neq",
  gt = "gt",
  gte = "gte",
  lt = "lt",
  lte = "lte",
  startsWith = "startsWith",
  endsWith = "endsWith",
  contains = "contains",
  regex = "regex",
}

export enum NotApplicableCompareFunction {
  isTrue = "isTrue",
  isFalse = "isFalse",
  empty = "empty",
  notEmpty = "notEmpty",
}

export interface CompareNodeOptions extends SwitchNodeOptions {
  property: string;
  propertyType: string;
  operation: ApplicableCompareFunction | NotApplicableCompareFunction;
  compare: string;
  compareType: string;

  //deprecated since 0.21.1
  operator?: string;
  value?: string;
  valueType?: string;
}

export const CompareNodeOptionsDefaults: CompareNodeOptions = {
  ...SwitchNodeOptionsDefaults,
  seperatedOutputs: false,
  outputs: 1,
  property: "payload",
  propertyType: "msg",
  operation: ApplicableCompareFunction.eq,
  compare: "",
  compareType: "str",
};

export interface CompareNodeDef extends SwitchNodeDef, CompareNodeOptions {}

export interface CompareEditorNodeProperties
  extends SwitchEditorNodeProperties,
    CompareNodeOptions {}

export const CompareEditorNodePropertiesDefaults: EditorNodePropertiesDef<CompareEditorNodeProperties> =
  {
    ...SwitchEditorNodePropertiesDefaults,
    seperatedOutputs: {
      value: CompareNodeOptionsDefaults.seperatedOutputs,
      required: true,
    },
    outputs: { value: CompareNodeOptionsDefaults.outputs, required: true },
    property: { value: CompareNodeOptionsDefaults.property, required: true },
    propertyType: {
      value: CompareNodeOptionsDefaults.propertyType,
      required: true,
    },
    operation: { value: CompareNodeOptionsDefaults.operation, required: true },
    compare: { value: CompareNodeOptionsDefaults.compare, required: true },
    compareType: {
      value: CompareNodeOptionsDefaults.compareType,
      required: true,
    },
  };

export interface Comparator {
  func: (propertyValue: any, compareValue?: any) => boolean;
  propertyOnly: boolean;
}
