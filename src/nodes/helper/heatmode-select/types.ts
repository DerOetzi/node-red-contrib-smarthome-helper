import { BaseNodeEditorProperties } from "../../flowctrl/base/types";
import {
  defaultMatchJoinNodeConfig,
  MatchJoinNodeConfig,
  MatchJoinNodeEditorProperties,
} from "../../flowctrl/match-join/types";
import { NodeColor, NodeType } from "../../types";
import { helperCategory } from "../types";
import { defaultMatcherRow } from "../../flowctrl/match-join/types";

export interface HeatModeSelectNodeConfig extends MatchJoinNodeConfig {
  comfortMode: string;
  ecoMode: string;
  boostMode: string;
  frostProtectionMode: string;
}

export const defaultHeatModeSelectNodeConfig: Partial<HeatModeSelectNodeConfig> =
  {
    comfortMode: "comfort",
    ecoMode: "eco",
    boostMode: "boost",
    frostProtectionMode: "frost protection",
    matchers: [
      {
        ...defaultMatcherRow,
        target: "heatmode",
      },
      {
        ...defaultMatcherRow,
        target: "comfortTemp",
      },
      {
        ...defaultMatcherRow,
        target: "ecoTempOffset",
      },
    ],
    join: true,
    minMsgCount: 3,
    discardNotMatched: true,
  };

export interface HeatModeSelectNodeEditorProperties
  extends MatchJoinNodeEditorProperties {
  comfortMode: string;
  ecoMode: string;
  boostMode: string;
  frostProtectionMode: string;
}

export const HeatModeSelectNodeType = new NodeType(
  helperCategory,
  "heatmode-select",
  NodeColor.Heating
);
