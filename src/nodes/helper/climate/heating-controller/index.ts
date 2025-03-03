import { BaseNodeDebounceData } from "@base/types";
import { HelperClimateCategory } from "@climate/types";
import { convertToMilliseconds } from "@helpers/time.helper";
import { LogicalOperation } from "@logical/op";
import MatchJoinNode from "@match-join";
import { NodeCategory } from "@nodes/types";
import { Node, NodeAPI, NodeStatusFill } from "node-red";
import {
  HeatingControllerCommand,
  HeatingControllerNodeData,
  HeatingControllerNodeDef,
  HeatingControllerNodeOptions,
  HeatingControllerNodeOptionsDefaults,
  HeatingControllerTarget,
  HeatMode,
} from "./types";

export default class HeatingControllerNode extends MatchJoinNode<
  HeatingControllerNodeDef,
  HeatingControllerNodeOptions
> {
  protected static readonly _nodeCategory: NodeCategory = HelperClimateCategory;
  protected static readonly _nodeType: string = "heating-controller";

  private timer: NodeJS.Timeout | null = null;

  private activeConditions: Record<string, boolean> = {};
  private windowsStates: Record<string, boolean> = {};

  private _blocked: boolean = false;
  private lastHeatmode: string = "";

  private comfortTemperature: number = 22;
  private ecoTemperatureOffset: number = -2;

  private pvBoost = false;

  constructor(RED: NodeAPI, node: Node, config: HeatingControllerNodeDef) {
    super(RED, node, config, HeatingControllerNodeOptionsDefaults);

    this.registerStatusOutput({
      output: 3,
      topic: "controller_status",
      automatic: false,
    });

    this.activeConditions["__default__"] = this.config.defaultActive;
  }

  protected initialize() {
    this.blocked = false;
    this.handleActiveCondition();
  }

  protected onClose(): void {
    super.onClose();
    this.activeConditions = {};
    this.windowsStates = {};
  }

  protected matched(data: HeatingControllerNodeData): void {
    const msg = data.msg;
    const topic = msg.topic;

    switch (topic) {
      case HeatingControllerTarget.activeCondition:
        if (this.activeConditions.hasOwnProperty("__default__")) {
          delete this.activeConditions["__default__"];
        }
        this.activeConditions[msg.originalTopic] = msg.payload as boolean;
        this.handleActiveCondition();
        break;
      case HeatingControllerTarget.comfortTemperature:
        this.comfortTemperature = msg.payload as number;
        this.sendAction((this.nodeStatus as string) ?? "");
        break;
      case HeatingControllerTarget.ecoTemperatureOffset:
        this.ecoTemperatureOffset = msg.payload as number;
        this.sendAction((this.nodeStatus as string) ?? "");
        break;
      case HeatingControllerTarget.pvBoost:
        this.pvBoost = msg.payload as boolean;
        this.sendAction((this.nodeStatus as string) ?? "");
        break;
      case HeatingControllerTarget.command:
        this.blocked = msg.command === HeatingControllerCommand.block;
        this.handleCommand(msg);
        break;
      case HeatingControllerTarget.manualControl:
        this.handleManualControl(msg);
        break;
      case HeatingControllerTarget.windowOpen:
        this.windowsStates[msg.originalTopic] = msg.payload as boolean;
        this.handleWindowOpen(msg);
        break;
    }
  }

  private handleActiveCondition() {
    if (!this.blocked) {
      if (this.isComfort()) {
        this.sendAction(this.config.comfortCommand!);
      } else {
        this.sendAction(this.config.ecoCommand!);
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

  private handleWindowOpen(msg: any) {
    const windowOpen = LogicalOperation.or(Object.values(this.windowsStates));

    let ha_action = "";

    if (windowOpen) {
      this.blocked = true;
      this.sendAction(this.config.frostProtectionCommand!, true);
      ha_action = "switch.turn_on";
    } else {
      this.blocked = false;
      this.handleActiveCondition();
      ha_action = "switch.turn_off";
    }

    this.debounce({
      msg: msg,
      payload: windowOpen,
      output: 2,
      additionalAttributes: { ha_action },
    });
  }

  private sendAction(heatmode: string, ignoreBlocked: boolean = false) {
    if (heatmode) {
      if (!this.blocked || ignoreBlocked) {
        this.debounce({
          msg: { topic: "heatmode" },
          payload: heatmode,
          output: 0,
        });
      } else {
        this.lastHeatmode = heatmode;
      }
    }

    let targetTemperature = this.determineHeatingSetpoint(heatmode);

    if (targetTemperature >= 0) {
      if (this.config.pvBoostEnabled && this.pvBoost) {
        targetTemperature += Number(this.config.pvBoostTemperatureOffset);
      }

      this.debounce({
        msg: { topic: "target_temperature" },
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
      text = this.RED._("helper.heating-controller.status.automationOff");
    } else {
      text = this.RED._("helper.heating-controller.status.automationOn");
    }

    const targetTemperature = this.determineHeatingSetpoint(status);

    if (targetTemperature >= 0) {
      text += " - " + status;
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
