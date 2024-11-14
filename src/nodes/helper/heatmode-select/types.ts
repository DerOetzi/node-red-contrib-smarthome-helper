import {
  defaultMatcherRow,
  MatchJoinNodeConfig,
  MatchJoinNodeEditorProperties,
} from "../../flowctrl/match-join/types";
import { NodeColor, NodeType } from "../../types";
import { helperCategory } from "../types";

export interface HeatModeSelectNodeConfig extends MatchJoinNodeConfig {
  comfortMode: string;
  ecoMode: string;
  boostMode: string;
  frostProtectionMode: string;
  checkAutomationInProgress: boolean;
  automationProgressId: string;
  pauseTime: number;
  pauseTimeUnit: string;
}

export const defaultHeatModeSelectNodeConfig: Partial<HeatModeSelectNodeConfig> =
  {
    comfortMode: "comfort",
    ecoMode: "eco",
    boostMode: "boost",
    frostProtectionMode: "frost protection",
    checkAutomationInProgress: false,
    automationProgressId: "",
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
    pauseTime: 30,
    pauseTimeUnit: "m",
  };

export interface HeatModeSelectNodeEditorProperties
  extends MatchJoinNodeEditorProperties {
  comfortMode: string;
  ecoMode: string;
  boostMode: string;
  frostProtectionMode: string;
  checkAutomationInProgress: boolean;
  automationProgressId: string;
  pauseTime: number;
  pauseTimeUnit: string;
}

export const HeatModeSelectNodeType = new NodeType(
  helperCategory,
  "heatmode-select",
  NodeColor.Heating
);
