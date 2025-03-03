import {
  BaseEditorNodeProperties,
  BaseEditorNodePropertiesDefaults,
  BaseNodeDef,
  BaseNodeOptions,
  BaseNodeOptionsDefaults,
} from "@base/types";
import { NodeCategory } from "@nodes/types";
import { EditorNodePropertiesDef } from "node-red";

type ValueType = "msg" | "str" | "num" | "bool";

export enum DebounceFlank {
  both = "both",
  rising = "rising",
  falling = "falling",
}

export interface SwitchNodeOptions extends BaseNodeOptions {
  target: string;
  targetType: string;
  trueValue?: string;
  trueType: ValueType;
  falseValue?: string;
  falseType: ValueType;
  seperatedOutputs: boolean;
  debounceFlank: DebounceFlank;
  outputs: number;
}

export const SwitchNodeOptionsDefaults: SwitchNodeOptions = {
  ...BaseNodeOptionsDefaults,
  target: "payload",
  targetType: "msg",
  trueValue: "true",
  trueType: "bool",
  falseValue: "false",
  falseType: "bool",
  seperatedOutputs: true,
  debounceFlank: DebounceFlank.both,
  outputs: 2,
};

export interface SwitchNodeDef extends BaseNodeDef, SwitchNodeOptions {}

export interface SwitchEditorNodeProperties
  extends BaseEditorNodeProperties,
    SwitchNodeOptions {}

export const SwitchEditorNodePropertiesDefaults: EditorNodePropertiesDef<SwitchEditorNodeProperties> =
  {
    ...BaseEditorNodePropertiesDefaults,
    target: {
      value: SwitchNodeOptionsDefaults.target,
      required: true,
    },
    targetType: {
      value: SwitchNodeOptionsDefaults.targetType,
      required: true,
    },
    trueValue: {
      value: SwitchNodeOptionsDefaults.trueValue,
      required: false,
    },
    trueType: {
      value: SwitchNodeOptionsDefaults.trueType,
      required: true,
    },
    falseValue: {
      value: SwitchNodeOptionsDefaults.falseValue,
      required: false,
    },
    falseType: {
      value: SwitchNodeOptionsDefaults.falseType,
      required: true,
    },
    seperatedOutputs: {
      value: SwitchNodeOptionsDefaults.seperatedOutputs,
      required: true,
    },
    debounceFlank: {
      value: SwitchNodeOptionsDefaults.debounceFlank,
      required: true,
    },
    outputs: {
      value: SwitchNodeOptionsDefaults.outputs,
      required: true,
    },
  };

export const LogicalOpCategory: NodeCategory = {
  label: "Smarthome Operators",
  name: "logical",
  color: "#7fff00",
};
