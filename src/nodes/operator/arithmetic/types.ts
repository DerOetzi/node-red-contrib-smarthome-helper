import {
  InputNodeOptionsDefaults,
  MatcherRowDefaults,
  MatchJoinEditorNodeProperties,
  MatchJoinNodeDef,
  MatchJoinNodeOptions,
} from "../../flowctrl/match-join/types";

export enum ArithmeticFunction {
  add = "add",
  sub = "sub",
  mul = "mul",
  round = "round",
  mean = "mean",
  min = "min",
  max = "max",
}

export enum ArithmeticTarget {
  value = "value",
  minuend = "minuend",
}

export interface AdditionalValueRow {
  value: string;
  valueType: string;
}

export interface ArithmeticNodeOptions extends MatchJoinNodeOptions {
  operation: ArithmeticFunction;
  minValueCount: number;
  precision: number;
  additionalValues: AdditionalValueRow[];
}

export const ArithmeticNodeOptionsDefaults: ArithmeticNodeOptions = {
  ...InputNodeOptionsDefaults,
  matchers: [{ ...MatcherRowDefaults, target: "value", targetType: "str" }],
  operation: ArithmeticFunction.add,
  minValueCount: 1,
  precision: 0,
  additionalValues: [],
};

export interface ArithmeticNodeDef
  extends MatchJoinNodeDef, ArithmeticNodeOptions {}

export interface ArithmeticEditorNodeProperties
  extends MatchJoinEditorNodeProperties, ArithmeticNodeOptions {}
