import {
  defaultMatcherRow,
  MatchJoinNodeConfig,
  MatchJoinNodeEditorProperties,
} from "../../flowctrl/match-join/types";
import { NodeColor, NodeType } from "../../types";
import { helperCategory } from "../types";

type LightbulbType = "switch" | "dimmable" | "colortemperature" | "rgb";

export enum LightbulbCommand {
  On = "on",
  Off = "off",
  Nightmode = "night",
}

export interface HomeAssistantLightAction {
  action: "homeassistant.turn_on" | "homeassistant.turn_off";
  target: {
    entity_id: string[];
  };
  data?: {
    brightness?: number;
    color_temp?: number;
    hs_color?: [number, number];
    transition?: number;
  };
}

export interface LightbulbControllerNodeConfig extends MatchJoinNodeConfig {
  identifier: string;
  identifierType: string;
  lightbulbType: LightbulbType;
  homeAssistantOutput: boolean;
  onBrightness: number;
  transitionTime: number;
  colorTemperature: number;
  nightmodeBrightness: number;
  onCommand: string;
  offCommand: string;
  nightmodeCommand: string;
  colorCycle: boolean;
  fixColorHue: number;
  fixColorSaturation: number;
}

export const defaultLightbulbControllerNodeConfig: Partial<LightbulbControllerNodeConfig> =
  {
    matchers: [
      {
        ...defaultMatcherRow,
        target: "command",
        targetType: "str",
      },
      {
        ...defaultMatcherRow,
        target: "colorTemperature",
        targetType: "str",
      },
      { ...defaultMatcherRow, target: "hue", targetType: "str" },
      { ...defaultMatcherRow, target: "saturation", targetType: "str" },
    ],
    join: true,
    discardNotMatched: true,
    minMsgCount: 1,
    identifier: "",
    identifierType: "str",
    lightbulbType: "dimmable",
    homeAssistantOutput: true,
    onBrightness: 100,
    transitionTime: 0.3,
    colorTemperature: 327,
    nightmodeBrightness: 10,
    onCommand: LightbulbCommand.On,
    offCommand: LightbulbCommand.Off,
    nightmodeCommand: LightbulbCommand.Nightmode,
    colorCycle: false,
    fixColorHue: 360,
    fixColorSaturation: 100,
  };

export interface LightbulbControllerNodeEditorProperties
  extends MatchJoinNodeEditorProperties {
  identifier: string;
  identifierType: string;
  lightbulbType: LightbulbType;
  homeAssistantOutput: boolean;
  onBrightness: number;
  transitionTime: number;
  colorTemperature: number;
  nightmodeBrightness: number;
  onCommand: string;
  offCommand: string;
  nightmodeCommand: string;
  colorCycle: boolean;
  fixColorHue: number;
  fixColorSaturation: number;
}

export const LightbulbControllerNodeType = new NodeType(
  helperCategory,
  "lightbulb-controller",
  NodeColor.Light
);
