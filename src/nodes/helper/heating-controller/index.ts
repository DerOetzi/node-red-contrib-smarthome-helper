import { Node, NodeStatusFill } from "node-red";
import { RED } from "../../../globals";
import { convertToMilliseconds } from "../../../helpers/time.helper";
import { BaseNodeDebounceData } from "../../flowctrl/base/types";
import MatchJoinNode from "../../flowctrl/match-join";
import { MatchJoinNodeData } from "../../flowctrl/match-join/types";
import { andOp, orOp } from "../../logical/op/operations";
import { NodeType } from "../../types";
import {
  defaultHeatingControllerNodeConfig,
  HeatingControllerCommand,
  HeatingControllerNodeConfig,
  HeatingControllerNodeType,
  HeatMode,
} from "./types";

export default class HeatingControllerNode extends MatchJoinNode<HeatingControllerNodeConfig> {
  static get type(): NodeType {
    return HeatingControllerNodeType;
  }

  private timer: NodeJS.Timeout | null = null;

  constructor(
    node: Node,
    config: HeatingControllerNodeConfig,
    private activeConditions: Record<string, boolean> = {},
    private windowsStates: Record<string, boolean> = {},
    private _blocked: boolean = false,
    private comfortTemperature: number = 22,
    private ecoTemperatureOffset: number = -2,
    private lastHeatmode: string = ""
  ) {
    config = { ...defaultHeatingControllerNodeConfig, ...config };
    super(node, config, {
      statusOutput: { output: 3, topic: "controller_status", automatic: false },
      initializeDelay: config.statusDelay,
    });
  }

  protected initialize() {
    this.blocked = false;
    this.nodeStatus = this.lastHeatmode;
  }

  protected onClose(): void {
    super.onClose();
    this.activeConditions = {};
    this.windowsStates = {};
  }

  protected matched(data: MatchJoinNodeData): void {
    const msg = data.received_msg;
    const topic = msg.topic;

    switch (topic) {
      case "activeCondition":
        this.activeConditions[msg.originalTopic] = msg.payload;
        this.handleActiveCondition();
        break;
      case "comfortTemperature":
        this.comfortTemperature = msg.payload;
        this.sendAction(this.nodeStatus);
        break;
      case "ecoTemperatureOffset":
        this.ecoTemperatureOffset = msg.payload;
        this.sendAction(this.nodeStatus);
        break;
      case "command":
        this.blocked = msg.command === HeatingControllerCommand.block;

        this.handleCommand(msg);
        break;
      case "manual_control":
        this.handleManualControl(msg);
        break;
      case "windowOpen":
        this.windowsStates[msg.originalTopic] = msg.payload;
        this.handleWindowOpen(msg);
        break;
    }
  }

  private handleActiveCondition() {
    if (!this.blocked) {
      if (this.isComfort()) {
        this.sendAction(this.config.comfortCommand);
      } else {
        this.sendAction(this.config.ecoCommand);
      }
    }
  }

  private isComfort(): boolean {
    return andOp(Object.values(this.activeConditions));
  }

  private handleManualControl(msg: any) {
    if (!this.blocked) {
      this.blocked = (this.lastHeatmode &&
        msg.payload !== this.lastHeatmode) as boolean;
    }

    this.sendAction(msg.payload);
  }

  private handleCommand(msg: any): void {
    if (msg?.heatmode) {
      let heatmode = msg.heatmode;
      switch (heatmode) {
        case HeatMode.comfort:
          heatmode = this.config.comfortCommand;
          break;
        case HeatMode.eco:
          heatmode = this.config.ecoCommand;
          break;
        case HeatMode.boost:
          heatmode = this.config.boostCommand;
          break;
        case HeatMode.frostProtection:
          heatmode = this.config.frostProtectionCommand;
          break;
      }
      this.sendAction(heatmode);
    } else {
      this.handleActiveCondition();
    }
  }

  private get blocked(): boolean {
    return this._blocked;
  }

  private set blocked(value: boolean) {
    this._blocked = value;
    this.sendStatus(!value);
    value ? this.startTimer() : this.clearTimer();
  }

  private startTimer() {
    if (!this.timer) {
      this.timer = setTimeout(
        () => {
          this.clearTimer();
          this.blocked = false;
          this.handleActiveCondition();
        },
        convertToMilliseconds(this.config.pause, this.config.pauseUnit)
      );
    }
  }

  private clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private handleWindowOpen(msg: any) {
    const windowOpen = orOp(Object.values(this.windowsStates));

    let ha_action = "";

    if (windowOpen) {
      this.blocked = true;
      this.sendAction(this.config.frostProtectionCommand, true);
      ha_action = "switch.turn_on";
    } else {
      this.blocked = false;
      this.handleActiveCondition();
      ha_action = "switch.turn_off";
    }

    this.debounce({
      received_msg: msg,
      payload: windowOpen,
      output: 2,
      additionalAttributes: { ha_action },
    });
  }

  private sendAction(heatmode: string, ignoreBlocked: boolean = false) {
    if (heatmode) {
      if (!this.blocked || ignoreBlocked) {
        this.debounce({
          received_msg: { topic: "heatmode" },
          payload: heatmode,
          output: 0,
        });
      } else {
        this.lastHeatmode = heatmode;
      }
    }

    let targetTemperature = this.determineHeatingSetpoint(heatmode);

    if (targetTemperature >= 0) {
      this.debounce({
        received_msg: { topic: "target_temperature" },
        payload: targetTemperature,
        output: 1,
      });
    }
  }

  protected updateStatusAfterDebounce(data: BaseNodeDebounceData): void {
    if (data.output === 0) {
      this.lastHeatmode = data.payload;
      this.nodeStatus = data.payload;
    } else if (this.lastHeatmode) {
      this.nodeStatus = this.lastHeatmode;
    }
  }
  protected statusColor(status: any): NodeStatusFill {
    let color: NodeStatusFill = "green";

    if (status === null) {
      color = "grey";
    } else if (this.blocked) {
      color = "red";
    }

    return color;
  }

  protected statusTextFormatter(status: any): string {
    let text = "";
    if (status === null) {
      text = "Unknown";
    } else if (this.blocked) {
      text = RED._("helper.heating-controller.status.automationOff");
    } else {
      text = RED._("helper.heating-controller.status.automationOn");
    }

    const targetTemperature = this.determineHeatingSetpoint(status);

    text += " - " + status;
    text += " (" + targetTemperature + " °C)";

    return text;
  }

  private determineHeatingSetpoint(heatmode: string): number {
    let targetTemperature = -1;
    switch (heatmode) {
      case this.config.comfortCommand:
        targetTemperature = this.comfortTemperature;
        break;
      case this.config.ecoCommand:
        targetTemperature = this.comfortTemperature + this.ecoTemperatureOffset;
        break;
      case this.config.boostCommand:
        targetTemperature =
          this.comfortTemperature + this.config.boostTemperatureOffset;
        break;
      case this.config.frostProtectionCommand:
        targetTemperature = this.config.frostProtectionTemperature;
        break;
    }
    return targetTemperature;
  }
}
