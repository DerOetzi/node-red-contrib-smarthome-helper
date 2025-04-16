import { Node, NodeAPI, NodeStatusFill } from "node-red";
import { NodeMessageFlow } from "../../../flowctrl/base/types";
import MatchJoinNode from "../../../flowctrl/match-join";
import { NodeCategory } from "../../../types";
import { HelperLightCategory } from "../types";
import {
  HomeAssistantLightAction,
  LightCommand,
  LightControllerNodeDef,
  LightControllerNodeMessageFlow,
  LightControllerNodeOptions,
  LightControllerNodeOptionsDefaults,
  LightControllerTarget,
} from "./types";

export default class LightControllerNode extends MatchJoinNode<
  LightControllerNodeDef,
  LightControllerNodeOptions
> {
  protected static readonly _nodeCategory: NodeCategory = HelperLightCategory;
  protected static readonly _nodeType: string = "light-controller";

  private colorTemperature: number;
  private fixColorHue: number;
  private fixColorSaturation: number;

  private colorCycle: NodeJS.Timeout | null = null;

  constructor(RED: NodeAPI, node: Node, config: LightControllerNodeDef) {
    super(RED, node, config, LightControllerNodeOptionsDefaults);

    this.colorTemperature = this.config.colorTemperature;
    this.fixColorHue = this.config.fixColorHue;
    this.fixColorSaturation = this.config.fixColorSaturation;
  }

  protected onClose(): void {
    this.clearColorCycle();
  }

  protected matched(messageFlow: NodeMessageFlow): void {
    const topic = messageFlow.topic;

    switch (topic) {
      case LightControllerTarget.command:
        break;
      case LightControllerTarget.colorTemperature:
        this.colorTemperature = messageFlow.payload as number;
        messageFlow.payload = this.nodeStatus;
        break;
      case LightControllerTarget.hue:
        this.fixColorHue = messageFlow.payload as number;
        messageFlow.payload = this.nodeStatus;
        break;
      case LightControllerTarget.saturation:
        this.fixColorSaturation = messageFlow.payload as number;
        messageFlow.payload = this.nodeStatus;
        break;
    }

    this.handleCommand(messageFlow);
  }

  private handleCommand(messageFlow: NodeMessageFlow): void {
    let command: string | boolean | LightCommand | null = messageFlow.payload;

    if (command === null) {
      return;
    }

    command = this.parseCommand(command);
    if (!command) {
      this.node.error("Invalid command");
      return;
    }

    let lightMessageFlow: LightControllerNodeMessageFlow =
      LightControllerNodeMessageFlow.clone(messageFlow);

    lightMessageFlow.lightbulbs = this.config.identifiers.map((identifier) => {
      return this.RED.util.evaluateNodeProperty(
        identifier.identifier,
        identifier.identifierType,
        this.node,
        lightMessageFlow.originalMsg
      );
    });

    switch (command) {
      case LightCommand.On:
        if (this.config.lightbulbType === "rgb") {
          lightMessageFlow = this.colorOn(lightMessageFlow);
        } else {
          lightMessageFlow = this.prepareOnMessage(lightMessageFlow);
        }
        break;
      case LightCommand.Off:
        lightMessageFlow = this.prepareOffMessage(lightMessageFlow);
        break;
      case LightCommand.Nightmode:
        lightMessageFlow = this.prepareNightmodeMessage(lightMessageFlow);
        break;
    }

    lightMessageFlow.updateAdditionalAttribute(
      "command",
      command as LightCommand
    );

    this.debounce(lightMessageFlow);
  }

  protected updateStatusAfterDebounce(messageFlow: NodeMessageFlow): void {
    this.nodeStatus = messageFlow.getAdditionalAttribute("command");
  }

  private parseCommand(
    command: boolean | string | LightCommand
  ): LightCommand | null {
    let parsed = null;

    if (typeof command === "boolean") {
      parsed = command ? LightCommand.On : LightCommand.Off;
    } else if (Object.keys(LightCommand).includes(command)) {
      parsed = command as LightCommand;
    } else {
      command = command.toLowerCase();
      switch (command) {
        case this.config.onCommand?.toLowerCase():
          parsed = LightCommand.On;
          break;
        case this.config.offCommand?.toLowerCase():
          parsed = LightCommand.Off;
          break;
        case this.config.nightmodeCommand?.toLowerCase():
          parsed = LightCommand.Nightmode;
          break;
      }
    }
    return parsed;
  }

  private prepareOffMessage(
    messageFlow: LightControllerNodeMessageFlow
  ): LightControllerNodeMessageFlow {
    this.clearColorCycle();
    messageFlow.on = false;
    return this.prepareHAOutput(messageFlow);
  }

  private colorOn(
    messageFlow: LightControllerNodeMessageFlow
  ): LightControllerNodeMessageFlow {
    this.clearColorCycle();

    if (this.config.colorCycle) {
      messageFlow = this.prepareOnMessage(
        messageFlow,
        this.config.onBrightness,
        [this.calculateHue(), 100]
      );

      let colorCycleMessageFlow = messageFlow.clone();
      delete colorCycleMessageFlow.send;
      colorCycleMessageFlow.updateAdditionalAttribute(
        "command",
        LightCommand.On
      );

      this.colorCycle = setInterval(() => {
        const color = [this.calculateHue(), 100];

        this.debounce(
          this.prepareOnMessage(
            colorCycleMessageFlow,
            this.config.onBrightness,
            color
          )
        );
      }, 60000);
    } else {
      messageFlow = this.prepareOnMessage(
        messageFlow,
        this.config.onBrightness,
        [this.fixColorHue, this.fixColorSaturation]
      );
    }

    return messageFlow;
  }

  private calculateHue(): number {
    const minute = new Date().getMinutes();
    return minute * 6;
  }

  private prepareOnMessage(
    messageFlow: LightControllerNodeMessageFlow,
    brightness?: number,
    color?: number[]
  ): LightControllerNodeMessageFlow {
    messageFlow.on = true;

    brightness = brightness ?? this.config.onBrightness;
    color = color ?? [this.config.fixColorHue, this.config.fixColorSaturation];

    if (this.config.lightbulbType !== "switch") {
      messageFlow.brightness = brightness;

      if (this.config.transitionTime > 0) {
        messageFlow.transition = this.config.transitionTime;
      }

      if (this.config.lightbulbType === "colortemperature") {
        messageFlow.colorTemperature = this.colorTemperature;
      } else if (this.config.lightbulbType === "rgb") {
        messageFlow.hue = color[0];
        messageFlow.saturation = color[1];
      }
    }

    return this.prepareHAOutput(messageFlow);
  }

  private prepareNightmodeMessage(
    messageFlow: LightControllerNodeMessageFlow
  ): LightControllerNodeMessageFlow {
    return this.prepareOnMessage(
      messageFlow,
      this.config.nightmodeBrightness,
      [40, 100]
    );
  }

  private prepareHAOutput(
    messageFlow: LightControllerNodeMessageFlow
  ): LightControllerNodeMessageFlow {
    if (this.config.homeAssistantOutput) {
      const output: HomeAssistantLightAction = {
        action: messageFlow.on
          ? "homeassistant.turn_on"
          : "homeassistant.turn_off",
        target: {
          entity_id: messageFlow.lightbulbs!,
        },
      };

      if (messageFlow.on && this.config.lightbulbType !== "switch") {
        output.data = {
          brightness_pct: messageFlow.brightness,
        };

        if (this.config.lightbulbType === "colortemperature") {
          output.data.color_temp_kelvin = messageFlow.colorTemperature;
        } else if (this.config.lightbulbType === "rgb") {
          output.data.hs_color = [messageFlow.hue!, messageFlow.saturation!];
        }

        if (messageFlow.transition) {
          output.data.transition = messageFlow.transition;
        }
      }

      messageFlow.payload = output;
    }

    return messageFlow;
  }

  private clearColorCycle(): void {
    if (this.colorCycle) {
      clearInterval(this.colorCycle);
      this.colorCycle = null;
    }
  }

  protected statusColor(status: any): NodeStatusFill {
    switch (status) {
      case LightCommand.On:
        return "green";
      case LightCommand.Off:
        return "red";
      case LightCommand.Nightmode:
        return "blue";
      default:
        return "grey";
    }
  }
}
