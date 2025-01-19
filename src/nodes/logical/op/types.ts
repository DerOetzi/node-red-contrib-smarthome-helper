import { EditorNodePropertiesDef } from "node-red";
import {
  SwitchEditorNodeProperties,
  SwitchEditorNodePropertiesDefaults,
  SwitchNodeDef,
  SwitchNodeOptions,
  SwitchNodeOptionsDefaults,
} from "../switch/types";

export enum LogicalFunction {
  and = "and",
  or = "or",
  not = "not",
  nand = "nand",
  nor = "nor",
  xor = "xor",
  nxor = "nxor",
}

export interface LogicalOpNodeOptions extends SwitchNodeOptions {
  operation: LogicalFunction;
  minMsgCount: number;

  //deprecated since 0.21.0
  logical?: string;
}

export const LogicalOpNodeOptionsDefaults: LogicalOpNodeOptions = {
  ...SwitchNodeOptionsDefaults,
  filterkey: "filterResult",
  seperatedOutputs: false,
  outputs: 1,
  operation: LogicalFunction.and,
  minMsgCount: 1,
};

export interface LogicalOpNodeDef extends SwitchNodeDef, LogicalOpNodeOptions {}

export interface LogicalOpEditorNodeProperties
  extends SwitchEditorNodeProperties,
    LogicalOpNodeOptions {}

export const LogicalOpEditorNodePropertiesDefaults: EditorNodePropertiesDef<LogicalOpEditorNodeProperties> =
  {
    ...SwitchEditorNodePropertiesDefaults,
    seperatedOutputs: {
      value: LogicalOpNodeOptionsDefaults.seperatedOutputs,
      required: true,
    },
    outputs: { value: LogicalOpNodeOptionsDefaults.outputs, required: true },
    operation: {
      value: LogicalOpNodeOptionsDefaults.operation,
      required: true,
    },
    minMsgCount: {
      value: LogicalOpNodeOptionsDefaults.minMsgCount,
      required: true,
    },
  };
