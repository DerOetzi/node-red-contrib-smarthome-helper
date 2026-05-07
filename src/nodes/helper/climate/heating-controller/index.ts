import { Node, NodeAPI, NodeStatusFill } from "node-red";
import { NodeMessageFlow } from "../../../flowctrl/base/types";
import ActiveControllerNode from "../../../flowctrl/active-controller";
import { ActiveControllerTarget } from "../../../flowctrl/active-controller/types";
import { LogicalOperation } from "../../../logical/op";
import { NodeCategory } from "../../../types";
import { HelperClimateCategory } from "../types";
import {
  HeatingControllerNodeDef,
  HeatingControllerNodeMessage,
  HeatingControllerNodeOptions,
  HeatingControllerNodeOptionsDefaults,
  HeatingControllerTarget,
  HeatMode,
} from "./types";
import Migration from "../../../flowctrl/base/migration";
import HeatingControllerMigration from "./migration";

export default class HeatingControllerNode extends ActiveControllerNode<
  HeatingControllerNodeDef,
  HeatingControllerNodeOptions
> {
  protected static readonly _nodeCategory: NodeCategory = HelperClimateCategory;
  protected static readonly _nodeType: string = "heating-controller";
  protected static readonly _migration: Migration<any> =
    new HeatingControllerMigration();

  private comfortConditions: Record<string, boolean> = {};
  private windowsStates: Record<string, boolean> = {};

  private comfortTemperature: number = 22;
  private ecoTemperatureOffset: number = -2;

  private pvBoost = false;

  constructor(RED: NodeAPI, node: Node, config: HeatingControllerNodeDef) {
    super(RED, node, config, HeatingControllerNodeOptionsDefaults);
    this.initialize();
  }

  private initialize() {
    this.comfortConditions["__default__"] = this.config.defaultComfort;
    this.handleComfortCondition();
  }

  protected onClose(): void {
    super.onClose();
    this.comfortConditions = {};
    this.windowsStates = {};
  }

  protected matched(messageFlow: NodeMessageFlow): void {
    const topic = messageFlow.topic;

    switch (topic) {
      case ActiveControllerTarget.activeCondition:
        this.handleActivateTarget(messageFlow);
        break;
      case ActiveControllerTarget.command:
        this.handleCommandTarget(messageFlow);
        break;
      case ActiveControllerTarget.manualControl:
        this.handleManualControlTarget(messageFlow);
        break;
      case HeatingControllerTarget.comfortCondition:
        if (this.comfortConditions.hasOwnProperty("__default__")) {
          delete this.comfortConditions["__default__"];
        }
        this.comfortConditions[messageFlow.originalTopic ?? "comfort"] =
          messageFlow.payload as boolean;
        this.handleComfortCondition();
        break;
      case HeatingControllerTarget.comfortTemperature:
        this.comfortTemperature = messageFlow.payload as number;
        this.sendAction(this.lastsend);
        break;
      case HeatingControllerTarget.ecoTemperatureOffset:
        this.ecoTemperatureOffset = messageFlow.payload as number;
        this.sendAction(this.lastsend);
        break;
      case HeatingControllerTarget.pvBoost:
        this.pvBoost = messageFlow.payload as boolean;
        this.sendAction(this.lastsend);
        break;
      case HeatingControllerTarget.windowOpen:
        this.windowsStates[messageFlow.originalTopic ?? "window"] =
          messageFlow.payload as boolean;
        this.handleWindowOpen(messageFlow);
        break;
    }
  }

  protected onReactivate(): void {
    this.handleComfortCondition();
  }

  protected onCommand(messageFlow: NodeMessageFlow): void {
    this.handleCommand(messageFlow.originalMsg as HeatingControllerNodeMessage);
  }

  protected onManualControl(manual: any) {
    this.sendAction(manual);
  }

  private handleComfortCondition(ignoreBlocked: boolean = false): void {
    if (!this.blocked || ignoreBlocked) {
      if (this.isComfort()) {
        this.sendAction(this.config.comfortCommand);
      } else {
        this.sendAction(this.config.ecoCommand);
      }
    }
  }

  private isComfort(): boolean {
    return LogicalOperation.and(Object.values(this.comfortConditions));
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
      this.handleComfortCondition();
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
      this.handleComfortCondition();
      ha_action = "switch.turn_off";
    }

    const messageFlowWindowOpen = messageFlow.clone();
    messageFlowWindowOpen.payload = windowOpen;
    messageFlowWindowOpen.output = 2;
    messageFlowWindowOpen.updateAdditionalAttribute("ha_action", ha_action);

    this.debounce(messageFlowWindowOpen);
  }

  private sendAction(heatmode: string, ignoreBlocked: boolean = false) {
    if (!this.active) {
      return;
    }

    if (heatmode) {
      if (!this.blocked || ignoreBlocked) {
        const messageFlowHeatmode = new NodeMessageFlow(
          { topic: "heatmode", payload: heatmode },
          0,
        );
        this.debounce(messageFlowHeatmode);
      } else {
        this.lastsend = heatmode;
      }
    }

    let targetTemperature = this.determineHeatingSetpoint(heatmode);

    if (targetTemperature >= 0) {
      if (this.config.pvBoostEnabled && this.pvBoost) {
        targetTemperature += Number(this.config.pvBoostTemperatureOffset);
      }

      const messageFlowTemperature = new NodeMessageFlow(
        { topic: "target_temperature", payload: targetTemperature },
        1,
      );
      this.debounce(messageFlowTemperature);
    }
  }

  protected updateStatusAfterDebounce(messageFlow: NodeMessageFlow): void {
    if (messageFlow.output === 0) {
      this.lastsend = messageFlow.payload;
    }

    this.triggerNodeStatus();
  }

  protected statusColor(status: any): NodeStatusFill {
    let color: NodeStatusFill = "green";

    if (!this.active) {
      color = "red";
    } else if (status === null) {
      color = "grey";
    } else if (this.blocked) {
      color = "red";
    }

    return color;
  }

  protected statusTextFormatter(status: any): string {
    let text = "";

    if (!this.active) {
      return this.RED._("helper.heating-controller.state.inactive");
    }

    if (status === null) {
      text = "Unknown";
    } else if (this.blocked) {
      text = this.RED._("helper.heating-controller.state.automationOff");
    } else {
      text = this.RED._("helper.heating-controller.state.automationOn");
    }

    const targetTemperature = this.determineHeatingSetpoint(this.lastsend);

    if (targetTemperature >= 0) {
      text += " - " + this.lastsend;
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
