import {
  defaultMatcherRow,
  MatchJoinNodeConfig,
  MatchJoinNodeEditorProperties,
} from "../../flowctrl/match-join/types";
import { NodeColor, NodeType } from "../../types";
import { helperCategory } from "../types";

type LightType = "switch" | "dimmable" | "colortemperature" | "rgb";

export enum LightCommand {
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
    transition?: number;
    brightness_pct?: number;
    color_temp?: number;
    hs_color?: [number, number];
  };
}

export interface LightIdentifierRow {
  identifier: string;
  identifierType: string;
}

export const defaultLightIdentifierRow: LightIdentifierRow = {
  identifier: "",
  identifierType: "str",
};

export interface LightControllerNodeConfig extends MatchJoinNodeConfig {
  identifiers: LightIdentifierRow[];
  lightbulbType: LightType;
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

export const defaultLightControllerNodeConfig: Partial<LightControllerNodeConfig> =
  {
    matchers: [
      {
        ...defaultMatcherRow,
        target: "command",
        targetType: "str",
      },
    ],
    join: true,
    discardNotMatched: true,
    minMsgCount: 1,
    identifiers: [defaultLightIdentifierRow],
    lightbulbType: "dimmable",
    homeAssistantOutput: true,
    onBrightness: 100,
    transitionTime: 0.3,
    colorTemperature: 327,
    nightmodeBrightness: 10,
    onCommand: LightCommand.On,
    offCommand: LightCommand.Off,
    nightmodeCommand: LightCommand.Nightmode,
    colorCycle: true,
    fixColorHue: 360,
    fixColorSaturation: 100,
  };

export interface LightControllerNodeEditorProperties
  extends MatchJoinNodeEditorProperties {
  identifiers: LightIdentifierRow[];
  lightbulbType: LightType;
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

export const LightControllerNodeType = new NodeType(
  helperCategory,
  "light-controller",
  NodeColor.Light
);
