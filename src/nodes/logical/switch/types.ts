import {
  BaseEditorNodeProperties,
  BaseNodeDef,
  BaseNodeOptions,
  BaseNodeOptionsDefaults,
} from "../../flowctrl/base/types";
import { NodeCategory } from "../../types";

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

export const LogicalOpCategory: NodeCategory = {
  label: "Smarthome Operators",
  name: "logical",
  color: "#7fff00",
};
