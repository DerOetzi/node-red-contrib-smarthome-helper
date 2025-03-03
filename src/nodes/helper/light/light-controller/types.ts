import {
  BaseEditorNodePropertiesDefaults,
  BaseNodeOptionsDefaults,
} from "@base/types";
import {
  MatcherRowDefaults,
  MatchJoinEditorNodeProperties,
  MatchJoinNodeDef,
  MatchJoinNodeMessage,
  MatchJoinNodeOptions,
} from "@match-join/types";
import { EditorNodePropertiesDef } from "node-red";

export enum LightControllerTarget {
  command = "command",
  colorTemperature = "colorTemperature",
  hue = "hue",
  saturation = "saturation",
}

export enum LightType {
  dimmable = "dimmable",
  colortemperature = "colortemperature",
  switch = "switch",
  rgb = "rgb",
}

export enum LightCommand {
  On = "On",
  Off = "Off",
  Nightmode = "Nightmode",
}

export interface HomeAssistantLightAction {
  action: "homeassistant.turn_on" | "homeassistant.turn_off";
  target: {
    entity_id: string[];
  };
  data?: {
    transition?: number;
    brightness_pct?: number;
    color_temp_kelvin?: number;
    hs_color?: [number, number];
  };
}

export interface LightIdentifierRow {
  identifier: string;
  identifierType: string;
}

export const LightIdentifierRowDefaults: LightIdentifierRow = {
  identifier: "",
  identifierType: "str",
};

export interface LightControllerNodeOptions extends MatchJoinNodeOptions {
  identifiers: LightIdentifierRow[];
  lightbulbType: LightType;
  homeAssistantOutput: boolean;
  onBrightness: number;
  transitionTime: number;
  colorTemperature: number;
  nightmodeBrightness: number;
  onCommand?: string;
  offCommand?: string;
  nightmodeCommand?: string;
  colorCycle: boolean;
  fixColorHue: number;
  fixColorSaturation: number;
}

export const LightControllerNodeOptionsDefaults: LightControllerNodeOptions = {
  ...BaseNodeOptionsDefaults,
  matchers: [
    {
      ...MatcherRowDefaults,
      target: LightControllerTarget.command,
      targetType: "str",
    },
  ],
  join: false,
  discardNotMatched: true,
  minMsgCount: 1,
  identifiers: [LightIdentifierRowDefaults],
  lightbulbType: LightType.dimmable,
  homeAssistantOutput: true,
  onBrightness: 100,
  transitionTime: 0.3,
  colorTemperature: 327,
  nightmodeBrightness: 10,
  colorCycle: true,
  fixColorHue: 360,
  fixColorSaturation: 100,
  onCommand: "",
  offCommand: "",
  nightmodeCommand: "",
};

export interface LightControllerNodeDef
  extends MatchJoinNodeDef,
    LightControllerNodeOptions {}

export interface LightControllerEditorNodeProperties
  extends MatchJoinEditorNodeProperties,
    LightControllerNodeOptions {}

export const LightControllerEditorNodePropertiesDefaults: EditorNodePropertiesDef<LightControllerEditorNodeProperties> =
  {
    ...BaseEditorNodePropertiesDefaults,
    matchers: {
      value: LightControllerNodeOptionsDefaults.matchers,
      required: true,
    },
    discardNotMatched: {
      value: LightControllerNodeOptionsDefaults.discardNotMatched,
      required: true,
    },
    join: {
      value: LightControllerNodeOptionsDefaults.join,
      required: true,
    },
    minMsgCount: {
      value: LightControllerNodeOptionsDefaults.minMsgCount,
      required: true,
    },
    identifiers: {
      value: LightControllerNodeOptionsDefaults.identifiers,
      required: true,
    },
    lightbulbType: {
      value: LightControllerNodeOptionsDefaults.lightbulbType,
      required: true,
    },
    homeAssistantOutput: {
      value: LightControllerNodeOptionsDefaults.homeAssistantOutput,
      required: true,
    },
    onBrightness: {
      value: LightControllerNodeOptionsDefaults.onBrightness,
      required: true,
    },
    transitionTime: {
      value: LightControllerNodeOptionsDefaults.transitionTime,
      required: true,
    },
    colorTemperature: {
      value: LightControllerNodeOptionsDefaults.colorTemperature,
      required: true,
    },
    nightmodeBrightness: {
      value: LightControllerNodeOptionsDefaults.nightmodeBrightness,
      required: true,
    },
    colorCycle: {
      value: LightControllerNodeOptionsDefaults.colorCycle,
      required: true,
    },
    fixColorHue: {
      value: LightControllerNodeOptionsDefaults.fixColorHue,
      required: true,
    },
    fixColorSaturation: {
      value: LightControllerNodeOptionsDefaults.fixColorSaturation,
      required: true,
    },
    onCommand: {
      value: LightControllerNodeOptionsDefaults.onCommand,
      required: true,
    },
    offCommand: {
      value: LightControllerNodeOptionsDefaults.offCommand,
      required: true,
    },
    nightmodeCommand: {
      value: LightControllerNodeOptionsDefaults.nightmodeCommand,
      required: true,
    },
  };

export interface LightControllerNodeMessage extends MatchJoinNodeMessage {
  lightbulbs?: string[];
  on?: boolean;
  brightness?: number;
  transition?: number;
  colorTemperature?: number;
  hue?: number;
  saturation?: number;
}
