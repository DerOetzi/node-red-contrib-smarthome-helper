import {
  defaultMatcherRow,
  MatchJoinNodeConfig,
  MatchJoinNodeEditorProperties,
} from "../../flowctrl/match-join/types";
import { NodeColor, NodeType } from "../../types";
import { helperCategory } from "../types";

export enum HeatMode {
  comfort = "comfort",
  eco = "eco",
  boost = "boost",
  frostProtection = "frost protection",
}

export enum HeatingControllerCommand {
  block = "block",
  unblock = "unblock",
}

export interface HeatingControllerNodeConfig extends MatchJoinNodeConfig {
  statusDelay: number;
  pause: number;
  pauseUnit: string;
  boostTemperatureOffset: number;
  frostProtectionTemperature: number;
  comfortCommand: string;
  ecoCommand: string;
  boostCommand: string;
  frostProtectionCommand: string;
}

export const defaultHeatingControllerNodeConfig: Partial<HeatingControllerNodeConfig> =
  {
    matchers: [
      {
        ...defaultMatcherRow,
        target: "activeCondition",
        targetType: "str",
      },
      {
        ...defaultMatcherRow,
        target: "comfortTemperature",
        targetType: "str",
      },
      {
        ...defaultMatcherRow,
        target: "ecoTemperatureOffset",
        targetType: "str",
      },
      {
        ...defaultMatcherRow,
        target: "windowOpen",
        targetType: "str",
      },
      {
        ...defaultMatcherRow,
        target: "manual_control",
        targetType: "str",
      },
      {
        ...defaultMatcherRow,
        property: "command",
        operator: "not_empty",
        target: "command",
        targetType: "str",
      },
    ],
    statusDelay: 100,
    pause: 1,
    pauseUnit: "h",
    join: false,
    minMsgCount: 1,
    discardNotMatched: true,
    outputs: 4,
    boostTemperatureOffset: 5,
    frostProtectionTemperature: 8,
    comfortCommand: HeatMode.comfort,
    ecoCommand: HeatMode.eco,
    boostCommand: HeatMode.boost,
    frostProtectionCommand: HeatMode.frostProtection,
  };

export interface HeatingControllerNodeEditorProperties
  extends MatchJoinNodeEditorProperties {
  statusDelay: number;
  pause: number;
  pauseUnit: string;
  boostTemperatureOffset: number;
  frostProtectionTemperature: number;
  comfortCommand: string;
  ecoCommand: string;
  boostCommand: string;
  frostProtectionCommand: string;
}

export const HeatingControllerNodeType = new NodeType(
  helperCategory,
  "heating-controller",
  NodeColor.Climate
);
