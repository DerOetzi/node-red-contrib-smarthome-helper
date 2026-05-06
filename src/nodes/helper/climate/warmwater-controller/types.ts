import { BaseNodeOptionsDefaults } from "../../../flowctrl/base/types";
import {
  MatchJoinEditorNodeProperties,
  MatchJoinNodeDef,
  MatchJoinNodeOptions,
} from "../../../flowctrl/match-join/types";

export enum WarmWaterControllerTarget {
  activeCondition = "activeCondition",
}

export interface WarmWaterControllerNodeOptions extends MatchJoinNodeOptions {
  defaultActive: boolean;
}

export const WarmWaterControllerNodeOptionsDefaults: WarmWaterControllerNodeOptions =
  {
    ...BaseNodeOptionsDefaults,
    matchers: [],
    join: false,
    discardNotMatched: true,
    minMsgCount: 1,
    outputs: 1,
    defaultActive: true,
  };

export interface WarmWaterControllerNodeDef
  extends MatchJoinNodeDef, WarmWaterControllerNodeOptions {}

export interface WarmWaterControllerEditorNodeProperties
  extends MatchJoinEditorNodeProperties, WarmWaterControllerNodeDef {}
