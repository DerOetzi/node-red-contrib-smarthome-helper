import { Node, NodeStatusFill } from "node-red";
import { RED } from "../../../globals";
import { BaseNodeDebounceData } from "../../flowctrl/base/types";
import MatchJoinNode from "../../flowctrl/match-join";
import { NodeType } from "../../types";
import {
  defaultLightControllerNodeConfig,
  HomeAssistantLightAction,
  LightCommand,
  LightControllerNodeConfig,
  LightControllerNodeData,
  LightControllerNodeMessage,
  LightControllerNodeType,
} from "./types";

export default class LightControllerNode extends MatchJoinNode<LightControllerNodeConfig> {
  private colorTemperature: number;
  private fixColorHue: number;
  private fixColorSaturation: number;

  private colorCycle: NodeJS.Timeout | null = null;

  static get type(): NodeType {
    return LightControllerNodeType;
  }

  constructor(node: Node, config: LightControllerNodeConfig) {
    config = { ...defaultLightControllerNodeConfig, ...config };

    config.onBrightness = parseInt(config.onBrightness.toString());
    config.nightmodeBrightness = parseInt(
      config.nightmodeBrightness.toString()
    );
    config.transitionTime = parseFloat(config.transitionTime.toString());

    config.onCommand = config.onCommand.toLowerCase();
    config.offCommand = config.offCommand.toLowerCase();
    config.nightmodeCommand = config.nightmodeCommand.toLowerCase();

    super(node, config);

    this.colorTemperature = config.colorTemperature;
    this.fixColorHue = config.fixColorHue;
    this.fixColorSaturation = config.fixColorSaturation;
  }

  protected onClose(): void {
    this.clearColorCycle();
  }

  protected matched(data: LightControllerNodeData): void {
    const input = data.payload;

    if (!input.command) {
      return;
    }

    this.parseParameters(input);

    const command = this.parseCommand(input.command);
    if (!command) {
      this.node.error("Invalid command", input.command);
      return;
    }

    let msg = data.msg;

    msg.lightbulbs = this.config.identifiers.map((identifier) => {
      return RED.util.evaluateNodeProperty(
        identifier.identifier,
        identifier.identifierType,
        this.node,
        msg
      );
    });

    switch (command) {
      case LightCommand.On:
        if (this.config.lightbulbType === "rgb") {
          msg = this.colorOn(msg);
        } else {
          msg = this.prepareOnMessage(msg);
        }
        break;
      case LightCommand.Off:
        msg = this.prepareOffMessage(msg);
        break;
      case LightCommand.Nightmode:
        msg = this.prepareNightmodeMessage(msg);
        break;
    }

    data.msg = msg;
    data.payload = msg.payload;
    data.additionalAttributes = { command };

    this.debounce(data);
  }

  protected updateStatusAfterDebounce(data: BaseNodeDebounceData): void {
    this.nodeStatus = data.additionalAttributes!.command;
  }

  private parseParameters(input: any) {
    this.colorTemperature = input.colorTemperature ?? this.colorTemperature;
    this.colorTemperature = parseInt(this.colorTemperature.toString());

    this.fixColorHue = input.hue ?? this.fixColorHue;
    this.fixColorHue = parseInt(this.fixColorHue.toString());

    this.fixColorSaturation = input.saturation ?? this.fixColorSaturation;
    this.fixColorSaturation = parseInt(this.fixColorSaturation.toString());
  }

  private parseCommand(command: boolean | string): LightCommand | null {
    let parsed = null;

    if (typeof command === "boolean") {
      parsed = command ? LightCommand.On : LightCommand.Off;
    } else {
      command = command.toLowerCase();
      switch (command) {
        case LightCommand.On:
        case this.config.onCommand:
          parsed = LightCommand.On;
          break;
        case LightCommand.Off:
        case this.config.offCommand:
          parsed = LightCommand.Off;
          break;
        case LightCommand.Nightmode:
        case this.config.nightmodeCommand:
          parsed = LightCommand.Nightmode;
          break;
      }
    }
    return parsed;
  }

  private prepareOffMessage(
    msg: LightControllerNodeMessage
  ): LightControllerNodeMessage {
    this.clearColorCycle();
    msg.on = false;
    return this.prepareHAOutput(msg);
  }

  private colorOn(msg: LightControllerNodeMessage): LightControllerNodeMessage {
    this.clearColorCycle();

    if (this.config.colorCycle) {
      msg = this.prepareOnMessage(msg, this.config.onBrightness, [
        this.calculateHue(),
        100,
      ]);

      this.colorCycle = setInterval(() => {
        const color = [this.calculateHue(), 100];
        this.debounce({
          msg: this.prepareOnMessage(msg, this.config.onBrightness, color),
          additionalAttributes: { command: LightCommand.On },
        });
      }, 60000);
    } else {
      msg = this.prepareOnMessage(msg, this.config.onBrightness, [
        this.fixColorHue,
        this.fixColorSaturation,
      ]);
    }

    return msg;
  }

  private calculateHue(): number {
    const minute = new Date().getMinutes();
    return minute * 6;
  }

  private prepareOnMessage(
    msg: LightControllerNodeMessage,
    brightness?: number,
    color?: number[]
  ): LightControllerNodeMessage {
    msg.on = true;

    brightness = brightness ?? this.config.onBrightness;
    color = color ?? [this.config.fixColorHue, this.config.fixColorSaturation];

    if (this.config.lightbulbType !== "switch") {
      msg.brightness = brightness;

      if (this.config.transitionTime > 0) {
        msg.transition = this.config.transitionTime;
      }

      if (this.config.lightbulbType === "colortemperature") {
        msg.colorTemperature = this.colorTemperature;
      } else if (this.config.lightbulbType === "rgb") {
        msg.hue = color[0];
        msg.saturation = color[1];
      }
    }

    return this.prepareHAOutput(msg);
  }

  private prepareNightmodeMessage(
    msg: LightControllerNodeMessage
  ): LightControllerNodeMessage {
    return this.prepareOnMessage(
      msg,
      this.config.nightmodeBrightness,
      [40, 100]
    );
  }

  private prepareHAOutput(
    msg: LightControllerNodeMessage
  ): LightControllerNodeMessage {
    if (this.config.homeAssistantOutput) {
      const output: HomeAssistantLightAction = {
        action: msg.on ? "homeassistant.turn_on" : "homeassistant.turn_off",
        target: {
          entity_id: msg.lightbulbs!,
        },
      };

      if (msg.on && this.config.lightbulbType !== "switch") {
        output.data = {
          brightness_pct: msg.brightness,
        };

        if (this.config.lightbulbType === "colortemperature") {
          output.data.color_temp = msg.colorTemperature;
        } else if (this.config.lightbulbType === "rgb") {
          output.data.hs_color = [msg.hue!, msg.saturation!];
        }

        if (msg.transition) {
          output.data.transition = msg.transition;
        }
      }

      msg.payload = output;
    }

    return msg;
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
