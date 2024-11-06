import {
  BaseNodeConfig,
  BaseNodeEditorProperties,
} from "../../flowctrl/base/types";
import { NodeColor, NodeType } from "../../types";
import { helperCategory } from "../types";

export interface HeatModeSelectNodeConfig extends BaseNodeConfig {
  comfortMode: string;
  ecoMode: string;
  boostMode: string;
  frostProtectionMode: string;
  defaultComfortTemp: number;
  defaultEcoTemp: number;
}

export const defaultHeatModeSelectNodeConfig: Partial<HeatModeSelectNodeConfig> =
  {
    comfortMode: "comfort",
    ecoMode: "eco",
    boostMode: "boost",
    frostProtectionMode: "frost protection",
    defaultComfortTemp: 20,
    defaultEcoTemp: 16,
  };

export interface HeatModeSelectNodeEditorProperties
  extends BaseNodeEditorProperties {
  comfortMode: string;
  ecoMode: string;
  boostMode: string;
  frostProtectionMode: string;
  defaultComfortTemp: number;
  defaultEcoTemp: number;
}

export const HeatModeSelectNodeType = new NodeType(
  helperCategory,
  "heatmode-select",
  NodeColor.Heating
);
