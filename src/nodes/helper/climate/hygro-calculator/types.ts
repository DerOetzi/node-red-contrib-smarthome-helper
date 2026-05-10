import {
  InputNodeOptionsDefaults,
  MatcherRowDefaults,
  MatchJoinEditorNodeProperties,
  MatchJoinNodeDef,
  MatchJoinNodeOptions,
} from "../../../flowctrl/match-join/types";

export enum HygroCalculatorTarget {
  temperature = "temperature",
  humidity = "humidity",
}

export interface HygroCalculatorNodeOptions extends MatchJoinNodeOptions {}

export const HygroCalculatorNodeOptionsDefaults: HygroCalculatorNodeOptions = {
  ...InputNodeOptionsDefaults,
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
  outputs: 2,
};

export interface HygroCalculatorNodeDef
  extends MatchJoinNodeDef, HygroCalculatorNodeOptions {}

export interface HygroCalculatorEditorNodeProperties
  extends MatchJoinEditorNodeProperties, HygroCalculatorNodeOptions {}
