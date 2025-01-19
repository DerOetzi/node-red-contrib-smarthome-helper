import { Node, NodeAPI, NodeStatusFill } from "node-red";
import { BaseNodeDebounceData } from "../../flowctrl/base/types";
import MatchJoinNode from "../../flowctrl/match-join";
import { MatchJoinNodeData } from "../../flowctrl/match-join/types";
import { NodeCategory, NodeColor } from "../../types";
import { helperCategory } from "../types";
import {
  HomeAssistantLightAction,
  LightCommand,
  LightControllerNodeDef,
  LightControllerNodeMessage,
  LightControllerNodeOptions,
  LightControllerNodeOptionsDefaults,
  LightControllerTarget,
} from "./types";

export default class LightControllerNode extends MatchJoinNode<
  LightControllerNodeDef,
  LightControllerNodeOptions
> {
  public static readonly NodeCategory: NodeCategory = helperCategory;
  public static readonly NodeType: string = "light-controller";
  public static readonly NodeColor: NodeColor = NodeColor.Light;

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

  protected matched(data: MatchJoinNodeData): void {
    const msg = data.msg;
    const topic = msg.topic;

    switch (topic) {
      case LightControllerTarget.command:
        this.handleCommand(msg.payload as any, data);
        break;
      case LightControllerTarget.colorTemperature:
        this.colorTemperature = msg.payload as number;
        this.handleCommand(this.nodeStatus as any, data);
        break;
      case LightControllerTarget.hue:
        this.fixColorHue = msg.payload as number;
        this.handleCommand(this.nodeStatus as any, data);
        break;
      case LightControllerTarget.saturation:
        this.fixColorSaturation = msg.payload as number;
        this.handleCommand(this.nodeStatus as any, data);
        break;
    }
  }

  private handleCommand(
    command: string | boolean | LightCommand | null,
    data: MatchJoinNodeData
  ): void {
    if (command === null) {
      return;
    }

    command = this.parseCommand(command);
    if (!command) {
      this.node.error("Invalid command");
      return;
    }

    let msg = data.msg as LightControllerNodeMessage;

    msg.lightbulbs = this.config.identifiers.map((identifier) => {
      return this.RED.util.evaluateNodeProperty(
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

  private parseCommand(
    command: boolean | string | LightCommand
  ): LightCommand | null {
    let parsed = null;

    if (typeof command === "boolean") {
      parsed = command ? LightCommand.On : LightCommand.Off;
    } else if (Object.keys(LightCommand).includes(command)) {
      parsed = command as LightCommand;
      console.log("parsed", parsed);
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
