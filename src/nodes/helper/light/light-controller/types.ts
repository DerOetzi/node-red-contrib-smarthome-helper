import { EditorNodePropertiesDef } from "node-red";
import { cloneDeep } from "../../../../helpers/object.helper";
import {
  BaseEditorNodePropertiesDefaults,
  BaseNodeOptionsDefaults,
  NodeMessageFlow,
} from "../../../flowctrl/base/types";
import {
  MatcherRowDefaults,
  MatchJoinEditorNodeProperties,
  MatchJoinNodeDef,
  MatchJoinNodeOptions,
} from "../../../flowctrl/match-join/types";

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

export class LightControllerNodeMessageFlow extends NodeMessageFlow {
  public get lightbulbs(): string[] | undefined {
    return this.getAdditionalAttribute("lightbulbs");
  }

  public set lightbulbs(value: string[] | undefined) {
    this.updateAdditionalAttribute("lightbulbs", value);
  }

  public get on(): boolean | undefined {
    return this.getAdditionalAttribute("on");
  }

  public set on(value: boolean | undefined) {
    this.updateAdditionalAttribute("on", value);
  }

  public get brightness(): number | undefined {
    return this.getAdditionalAttribute("brightness");
  }

  public set brightness(value: number | undefined) {
    this.updateAdditionalAttribute("brightness", value);
  }

  public get transition(): number | undefined {
    return this.getAdditionalAttribute("transition");
  }

  public set transition(value: number | undefined) {
    this.updateAdditionalAttribute("transition", value);
  }

  public get colorTemperature(): number | undefined {
    return this.getAdditionalAttribute("colorTemperature");
  }

  public set colorTemperature(value: number | undefined) {
    this.updateAdditionalAttribute("colorTemperature", value);
  }

  public get hue(): number | undefined {
    return this.getAdditionalAttribute("hue");
  }

  public set hue(value: number | undefined) {
    this.updateAdditionalAttribute("hue", value);
  }
  public get saturation(): number | undefined {
    return this.getAdditionalAttribute("saturation");
  }
  public set saturation(value: number | undefined) {
    this.updateAdditionalAttribute("saturation", value);
  }

  public static clone(
    messageFlow: NodeMessageFlow
  ): LightControllerNodeMessageFlow {
    const clonedMessageFlow = new LightControllerNodeMessageFlow(
      messageFlow.originalMsg,
      messageFlow.output,
      messageFlow.send
    );
    clonedMessageFlow.topic = messageFlow.topic;
    clonedMessageFlow.payload = messageFlow.payload;

    clonedMessageFlow.additionalAttributes = cloneDeep(
      (messageFlow as LightControllerNodeMessageFlow).additionalAttributes
    );

    return clonedMessageFlow;
  }

  public clone(): LightControllerNodeMessageFlow {
    const clone = new LightControllerNodeMessageFlow(
      this.originalMsg,
      this.output,
      this.send
    );
    clone.topic = this.topic;
    clone.payload = this.payload;
    clone.additionalAttributes = cloneDeep(this.additionalAttributes);

    return clone;
  }
}
