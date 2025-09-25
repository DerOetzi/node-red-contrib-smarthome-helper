import { EditorNodePropertiesDef } from "node-red";
import {
  BaseEditorNodePropertiesDefaults,
  BaseNodeOptionsDefaults,
} from "nodes/flowctrl/base/types";
import {
  MatcherRowDefaults,
  MatchJoinEditorNodeProperties,
  MatchJoinNodeDef,
  MatchJoinNodeOptions,
} from "nodes/flowctrl/match-join/types";

export enum HygroCalculatorTarget {
  temperature = "temperature",
  humidity = "humidity",
}

export interface HygroCalculatorNodeOptions extends MatchJoinNodeOptions {}

export const HygroCalculatorNodeOptionsDefaults: HygroCalculatorNodeOptions = {
  ...BaseNodeOptionsDefaults,
  matchers: [
    {
      ...MatcherRowDefaults,
      target: HygroCalculatorTarget.temperature,
      targetType: "str",
    },
    {
      ...MatcherRowDefaults,
      target: HygroCalculatorTarget.humidity,
      targetType: "str",
    },
  ],
  join: false,
  discardNotMatched: true,
  minMsgCount: 2,
  outputs: 2,
};

export interface HygroCalculatorNodeDef
  extends MatchJoinNodeDef,
    HygroCalculatorNodeOptions {}

export interface HygroCalculatorEditorNodeProperties
  extends MatchJoinEditorNodeProperties,
    HygroCalculatorNodeOptions {}

export const HygroCalculatorEditorNodePropertiesDefaults: EditorNodePropertiesDef<HygroCalculatorEditorNodeProperties> =
  {
    ...BaseEditorNodePropertiesDefaults,
    matchers: {
      value: HygroCalculatorNodeOptionsDefaults.matchers,
      required: true,
    },
    discardNotMatched: {
      value: HygroCalculatorNodeOptionsDefaults.discardNotMatched,
      required: true,
    },
    join: {
      value: HygroCalculatorNodeOptionsDefaults.join,
      required: true,
    },
    minMsgCount: {
      value: HygroCalculatorNodeOptionsDefaults.minMsgCount,
      required: true,
    },
    outputs: {
      value: HygroCalculatorNodeOptionsDefaults.outputs,
      required: true,
    },
  };
