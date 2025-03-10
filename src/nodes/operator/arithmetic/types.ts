import { EditorNodePropertiesDef } from "node-red";
import {
  BaseEditorNodePropertiesDefaults,
  BaseNodeOptionsDefaults,
} from "../../flowctrl/base/types";
import {
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
  ...BaseNodeOptionsDefaults,
  matchers: [{ ...MatcherRowDefaults, target: "value", targetType: "str" }],
  discardNotMatched: true,
  join: false,
  minMsgCount: 1,
  operation: ArithmeticFunction.add,
  minValueCount: 1,
  precision: 0,
  additionalValues: [],
};

export interface ArithmeticNodeDef
  extends MatchJoinNodeDef,
    ArithmeticNodeOptions {}

export interface ArithmeticEditorNodeProperties
  extends MatchJoinEditorNodeProperties,
    ArithmeticNodeOptions {}

export const ArithmeticEditorNodePropertiesDefaults: EditorNodePropertiesDef<ArithmeticEditorNodeProperties> =
  {
    ...BaseEditorNodePropertiesDefaults,
    matchers: {
      value: ArithmeticNodeOptionsDefaults.matchers,
      required: true,
    },
    discardNotMatched: {
      value: ArithmeticNodeOptionsDefaults.discardNotMatched,
      required: true,
    },
    join: {
      value: ArithmeticNodeOptionsDefaults.join,
      required: true,
    },
    minMsgCount: {
      value: ArithmeticNodeOptionsDefaults.minMsgCount,
      required: true,
    },
    operation: {
      value: ArithmeticNodeOptionsDefaults.operation,
      required: true,
    },
    minValueCount: {
      value: ArithmeticNodeOptionsDefaults.minValueCount,
      required: true,
    },
    precision: {
      value: ArithmeticNodeOptionsDefaults.precision,
      required: true,
    },
    additionalValues: {
      value: ArithmeticNodeOptionsDefaults.additionalValues,
      required: false,
    },
  };
