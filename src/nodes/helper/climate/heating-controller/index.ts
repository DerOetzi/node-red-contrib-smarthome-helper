import { Node, NodeAPI, NodeStatusFill } from "node-red";
import { convertToMilliseconds } from "../../../../helpers/time.helper";
import { NodeMessageFlow } from "../../../flowctrl/base/types";
import MatchJoinNode from "../../../flowctrl/match-join";
import { LogicalOperation } from "../../../logical/op";
import { NodeCategory } from "../../../types";
import { HelperClimateCategory } from "../types";
import {
  HeatingControllerCommand,
  HeatingControllerNodeDef,
  HeatingControllerNodeMessage,
  HeatingControllerNodeOptions,
  HeatingControllerNodeOptionsDefaults,
  HeatingControllerTarget,
  HeatMode,
} from "./types";
import Migration from "../../../flowctrl/base/migration";
import HeatingControllerMigration from "./migration";

export default class HeatingControllerNode extends MatchJoinNode<
  HeatingControllerNodeDef,
  HeatingControllerNodeOptions
> {
  protected static readonly _nodeCategory: NodeCategory = HelperClimateCategory;
  protected static readonly _nodeType: string = "heating-controller";
  protected static readonly _migration: Migration<any> =
    new HeatingControllerMigration();

  private timer: NodeJS.Timeout | null = null;

  private activeConditions: Record<string, boolean> = {};
  private windowsStates: Record<string, boolean> = {};

  private lastHeatmode: string = "";

  private comfortTemperature: number = 22;
  private ecoTemperatureOffset: number = -2;

  private pvBoost = false;

  constructor(RED: NodeAPI, node: Node, config: HeatingControllerNodeDef) {
    super(RED, node, config, HeatingControllerNodeOptionsDefaults);
    this.initialize();
  }

  private initialize() {
    this.blocked = false;
    this.activeConditions["__default__"] = this.config.defaultActive;
    this.handleActiveCondition();
  }

  protected onClose(): void {
    super.onClose();
    this.activeConditions = {};
    this.windowsStates = {};
  }

  protected matched(messageFlow: NodeMessageFlow): void {
    const topic = messageFlow.topic;

    switch (topic) {
      case HeatingControllerTarget.activeCondition:
        if (this.activeConditions.hasOwnProperty("__default__")) {
          delete this.activeConditions["__default__"];
        }
        this.activeConditions[messageFlow.originalTopic ?? "active"] =
          messageFlow.payload as boolean;
        this.handleActiveCondition();
        break;
      case HeatingControllerTarget.comfortTemperature:
        this.comfortTemperature = messageFlow.payload as number;
        this.sendAction(this.lastHeatmode);
        break;
      case HeatingControllerTarget.ecoTemperatureOffset:
        this.ecoTemperatureOffset = messageFlow.payload as number;
        this.sendAction(this.lastHeatmode);
        break;
      case HeatingControllerTarget.pvBoost:
        this.pvBoost = messageFlow.payload as boolean;
        this.sendAction(this.lastHeatmode);
        break;
      case HeatingControllerTarget.command: {
        const commandMsg =
          messageFlow.originalMsg as HeatingControllerNodeMessage;
        this.blocked = commandMsg.command === HeatingControllerCommand.block;
        this.handleCommand(commandMsg);
        break;
      }
      case HeatingControllerTarget.manualControl:
        this.handleManualControl(messageFlow);
        break;
      case HeatingControllerTarget.windowOpen:
        this.windowsStates[messageFlow.originalTopic ?? "window"] =
          messageFlow.payload as boolean;
        this.handleWindowOpen(messageFlow);
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
    return LogicalOperation.and(Object.values(this.activeConditions));
  }

  private handleManualControl(msg: any) {
    if (!this.blocked) {
      this.blocked = (this.lastHeatmode &&
        msg.payload !== this.lastHeatmode) as boolean;
    }

    this.sendAction(msg.payload);
  }

  private handleCommand(msg: HeatingControllerNodeMessage): void {
    if (msg?.heatmode) {
      let heatmode: string = msg.heatmode;
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
    return !(this.nodeStatus as boolean);
  }

  private set blocked(value: boolean) {
    this.nodeStatus = !value;
    value ? this.startTimer() : this.clearTimer();
  }

  private startTimer() {
    if (this.config.reactivateEnabled && !this.timer) {
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

  private handleWindowOpen(messageFlow: NodeMessageFlow) {
    const windowOpen = LogicalOperation.or(Object.values(this.windowsStates));

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

    const messageFlowWindowOpen = messageFlow.clone();
    messageFlowWindowOpen.payload = windowOpen;
    messageFlowWindowOpen.output = 2;
    messageFlowWindowOpen.updateAdditionalAttribute("ha_action", ha_action);

    this.debounce(messageFlowWindowOpen);
  }

  private sendAction(heatmode: string, ignoreBlocked: boolean = false) {
    if (heatmode) {
      if (!this.blocked || ignoreBlocked) {
        const messageFlowHeatmode = new NodeMessageFlow(
          { topic: "heatmode", payload: heatmode },
          0
        );
        this.debounce(messageFlowHeatmode);
      } else {
        this.lastHeatmode = heatmode;
      }
    }

    let targetTemperature = this.determineHeatingSetpoint(heatmode);

    if (targetTemperature >= 0) {
      if (this.config.pvBoostEnabled && this.pvBoost) {
        targetTemperature += Number(this.config.pvBoostTemperatureOffset);
      }

      const messageFlowTemperature = new NodeMessageFlow(
        { topic: "target_temperature", payload: targetTemperature },
        1
      );
      this.debounce(messageFlowTemperature);
    }
  }

  protected updateStatusAfterDebounce(messageFlow: NodeMessageFlow): void {
    if (messageFlow.output === 0) {
      this.lastHeatmode = messageFlow.payload;
    }

    this.triggerNodeStatus();
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
      text = this.RED._("helper.heating-controller.state.automationOff");
    } else {
      text = this.RED._("helper.heating-controller.state.automationOn");
    }

    const targetTemperature = this.determineHeatingSetpoint(this.lastHeatmode);

    if (targetTemperature >= 0) {
      text += " - " + this.lastHeatmode;
      text += " (" + targetTemperature + " °C";

      if (this.config.pvBoostEnabled && this.pvBoost) {
        text += " +☀️";
      }

      text += ")";
    } else {
      text += " - Unknown";
    }

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
