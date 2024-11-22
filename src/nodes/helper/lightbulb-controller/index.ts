import { Node, NodeStatusFill } from "node-red";
import { RED } from "../../../globals";
import { BaseNodeDebounceData } from "../../flowctrl/base/types";
import MatchJoinNode from "../../flowctrl/match-join";
import { NodeType } from "../../types";
import {
  defaultLightbulbControllerNodeConfig,
  HomeAssistantLightAction,
  LightbulbCommand,
  LightbulbControllerNodeConfig,
  LightbulbControllerNodeType,
} from "./types";

export default class LightbulbControllerNode extends MatchJoinNode<LightbulbControllerNodeConfig> {
  private colorTemperature: number;
  private fixColorHue: number;
  private fixColorSaturation: number;

  private colorCycle: NodeJS.Timeout | null = null;

  static get type(): NodeType {
    return LightbulbControllerNodeType;
  }

  constructor(node: Node, config: LightbulbControllerNodeConfig) {
    config = { ...defaultLightbulbControllerNodeConfig, ...config };

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

  protected debounceListener(data: BaseNodeDebounceData): void {
    const input = data.result;

    if (!input.command) {
      return;
    }

    this.parseParameters(input);

    const command = this.parseCommand(input.command);
    if (!command) {
      this.node.error("Invalid command", input.command);
      return;
    }

    let msg = data.received_msg;

    msg.lightbulb = RED.util.evaluateNodeProperty(
      this.config.identifier,
      this.config.identifierType,
      this.node,
      msg
    );

    switch (command) {
      case LightbulbCommand.On:
        if (this.config.lightbulbType === "rgb") {
          this.colorOn(msg);
        } else {
          this.prepareOnMessage(msg);
        }
        break;
      case LightbulbCommand.Off:
        this.prepareOffMessage(msg);
        break;
      case LightbulbCommand.Nightmode:
        this.prepareNightmodeMessage(msg);
        break;
    }

    this.sendMsg(msg, { send: data.send });
    this.nodeStatus = command;
  }

  private parseParameters(input: any) {
    this.colorTemperature = input.colorTemperature ?? this.colorTemperature;
    this.colorTemperature = parseInt(this.colorTemperature.toString());

    this.fixColorHue = input.hue ?? this.fixColorHue;
    this.fixColorHue = parseInt(this.fixColorHue.toString());

    this.fixColorSaturation = input.saturation ?? this.fixColorSaturation;
    this.fixColorSaturation = parseInt(this.fixColorSaturation.toString());
  }

  private parseCommand(command: boolean | string): LightbulbCommand | null {
    let parsed = null;

    if (typeof command === "boolean") {
      parsed = command ? LightbulbCommand.On : LightbulbCommand.Off;
    } else {
      command = command.toLowerCase();
      switch (command) {
        case LightbulbCommand.On:
        case this.config.onCommand:
          parsed = LightbulbCommand.On;
          break;
        case LightbulbCommand.Off:
        case this.config.offCommand:
          parsed = LightbulbCommand.Off;
          break;
        case LightbulbCommand.Nightmode:
        case this.config.nightmodeCommand:
          parsed = LightbulbCommand.Nightmode;
          break;
      }
    }
    return parsed;
  }

  private prepareOffMessage(msg: any) {
    this.clearColorCycle();
    msg.on = false;
    return this.prepareHAOutput(msg);
  }

  private colorOn(msg: any) {
    this.clearColorCycle();

    if (this.config.colorCycle) {
      this.prepareOnMessage(msg, this.config.onBrightness, [
        this.calculateHue(),
        100,
      ]);

      this.colorCycle = setInterval(() => {
        const color = [this.calculateHue(), 100];
        this.sendMsg(
          this.prepareOnMessage(msg, this.config.onBrightness, color)
        );
      }, 60000);
    } else {
      this.prepareOnMessage(msg, this.config.onBrightness, [
        this.fixColorHue,
        this.fixColorSaturation,
      ]);
    }
  }

  private calculateHue() {
    const minute = new Date().getMinutes();
    return minute * 6;
  }

  private prepareOnMessage(msg: any, brightness?: number, color?: number[]) {
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

  private prepareNightmodeMessage(msg: any) {
    return this.prepareOnMessage(
      msg,
      this.config.nightmodeBrightness,
      [40, 100]
    );
  }

  private prepareHAOutput(msg: any) {
    if (this.config.homeAssistantOutput) {
      const output: HomeAssistantLightAction = {
        action: msg.on ? "homeassistant.turn_on" : "homeassistant.turn_off",
        target: {
          entity_id: [msg.lightbulb],
        },
      };

      if (msg.on && this.config.lightbulbType !== "switch") {
        output.data = {
          brightness: msg.brightness,
        };

        if (this.config.lightbulbType === "colortemperature") {
          output.data.color_temp = msg.colorTemperature;
        } else if (this.config.lightbulbType === "rgb") {
          output.data.hs_color = [msg.hue, msg.saturation];
        }

        if (msg.transition) {
          output.data.transition = msg.transition;
        }
      }

      msg.payload = output;
    }

    return msg;
  }

  private clearColorCycle() {
    if (this.colorCycle) {
      clearInterval(this.colorCycle);
      this.colorCycle = null;
    }
  }

  protected statusColor(status: any): NodeStatusFill {
    switch (status) {
      case LightbulbCommand.On:
        return "green";
      case LightbulbCommand.Off:
        return "red";
      case LightbulbCommand.Nightmode:
        return "blue";
      default:
        return "grey";
    }
  }
}
