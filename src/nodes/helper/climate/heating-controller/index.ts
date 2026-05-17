import { Node, NodeAPI, NodeStatusFill } from "node-red";
import { NodeMessageFlow } from "../../../flowctrl/base/types";
import ActiveControllerNode from "../../../flowctrl/active-controller";
import { ActiveControllerTarget } from "../../../flowctrl/active-controller/types";
import { LogicalOperation } from "../../../logical/op";
import { NodeCategory } from "../../../types";
import { HelperClimateCategory } from "../types";
import {
  HeatingControllerControllerMode,
  HeatingControllerNodeDef,
  HeatingControllerNodeMessage,
  HeatingControllerNodeOptions,
  HeatingControllerNodeOptionsDefaults,
  HeatingControllerTarget,
  HeatMode,
} from "./types";
import Migration from "../../../flowctrl/base/migration";
import HeatingControllerMigration from "./migration";
import { RoomMPCController } from "./mpc";
import { TrvIndex } from "./mpc/types";
import { TRV_MAX_COUNT } from "./mpc/const";

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

  private windowOpenState: boolean = false;
  private activeHeatmode: string = "";

  private get automaticModeSelectionAllowed(): boolean {
    return this.active && !this.blocked && !this.windowOpenState;
  }

  private readonly mpcController: RoomMPCController;

  constructor(RED: NodeAPI, node: Node, config: HeatingControllerNodeDef) {
    super(RED, node, config, HeatingControllerNodeOptionsDefaults);
    this.mpcController = new RoomMPCController(config);
    this.initialize();
  }

  private initialize() {
    this.activeHeatmode = this.config.defaultComfort
      ? this.config.comfortCommand
      : this.config.ecoCommand;
    this.comfortConditions["__default__"] = this.config.defaultComfort;
    this.handleComfortCondition();
  }

  protected onClose(): void {
    super.onClose();
    this.comfortConditions = { __default__: this.config.defaultComfort };
    this.windowsStates = {};
    this.windowOpenState = false;
    this.activeHeatmode = this.config.defaultComfort
      ? this.config.comfortCommand
      : this.config.ecoCommand;
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
        this.handleComfortConditionTarget(messageFlow);
        break;
      case HeatingControllerTarget.comfortTemperature:
        this.handleNumberUpdate(
          messageFlow,
          (value) => (this.comfortTemperature = value),
        );
        break;
      case HeatingControllerTarget.ecoTemperatureOffset:
        this.handleNumberUpdate(
          messageFlow,
          (value) => (this.ecoTemperatureOffset = value),
        );
        break;
      case HeatingControllerTarget.pvBoost:
        this.handleControlBooleanUpdate(
          messageFlow.payloadAsBoolean(false),
          (value) => (this.pvBoost = value),
        );
        break;
      case HeatingControllerTarget.windowOpen:
        this.windowsStates[messageFlow.originalTopic ?? "window"] =
          messageFlow.payload as boolean;
        this.handleWindowOpen(messageFlow);
        break;
      case HeatingControllerTarget.trv1:
      case HeatingControllerTarget.trv2:
      case HeatingControllerTarget.trv3:
        this.handleTrvTarget(topic, messageFlow);
        break;
      case HeatingControllerTarget.additionalTemperatureSensor:
        this.handleNumberUpdate(messageFlow, (value) =>
          this.mpcController.setAdditionalSensor(value),
        );
        break;
      case HeatingControllerTarget.outdoorTemperature:
        this.handleNumberUpdate(messageFlow, (value) =>
          this.mpcController.setOutdoorTemperature(value),
        );
        break;
      case HeatingControllerTarget.flowTemperature:
        this.handleNumberUpdate(messageFlow, (value) =>
          this.mpcController.setFlowTemperature(value),
        );
        break;
    }
  }

  private handleComfortConditionTarget(messageFlow: NodeMessageFlow): void {
    if (this.comfortConditions.hasOwnProperty("__default__")) {
      delete this.comfortConditions["__default__"];
    }
    this.comfortConditions[messageFlow.originalTopic ?? "comfort"] =
      messageFlow.payload as boolean;
    this.handleComfortCondition();
  }

  private handleControlBooleanUpdate(
    value: boolean,
    applyUpdate: (value: boolean) => void,
  ): void {
    applyUpdate(value);
    this.sendAction(this.activeHeatmode);
  }

  private handleTrvTarget(target: string, messageFlow: NodeMessageFlow): void {
    const indexMap: Record<string, TrvIndex> = {
      [HeatingControllerTarget.trv2]: 1,
      [HeatingControllerTarget.trv3]: 2,
    };
    const index: TrvIndex = indexMap[target] ?? 0;

    this.handleNumberUpdate(messageFlow, (value) =>
      this.mpcController.setTrvTemperature(index, value),
    );
  }

  private handleNumberUpdate(
    messageFlow: NodeMessageFlow,
    applyUpdate: (value: number) => void,
  ): void {
    const value = messageFlow.payloadAsNumber();
    if (value === undefined) {
      return;
    }
    applyUpdate(value);
    this.sendAction(this.activeHeatmode);
  }

  protected onReactivate(): void {
    this.handleComfortCondition();
  }

  protected onCommand(messageFlow: NodeMessageFlow): void {
    this.handleCommand(messageFlow.originalMsg);
  }

  protected onManualControl(manual: any) {
    this.sendAction(manual, true);
  }

  private handleComfortCondition(): void {
    if (this.automaticModeSelectionAllowed) {
      const desiredHeatmode = this.isComfort()
        ? this.config.comfortCommand
        : this.config.ecoCommand;
      this.sendAction(desiredHeatmode);
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
      this.sendAction(heatmode, true);
    } else {
      this.handleComfortCondition();
    }
  }

  private handleWindowOpen(messageFlow: NodeMessageFlow) {
    this.windowOpenState = LogicalOperation.or(
      Object.values(this.windowsStates),
    );

    let ha_action = "";

    if (this.windowOpenState) {
      this.sendAction(this.config.frostProtectionCommand);
      ha_action = "switch.turn_on";
    } else {
      if (this.automaticModeSelectionAllowed) {
        this.handleComfortCondition();
      } else if (this.activeHeatmode) {
        this.sendAction(this.activeHeatmode);
      }
      ha_action = "switch.turn_off";
    }

    const messageFlowWindowOpen = messageFlow.clone();
    messageFlowWindowOpen.payload = this.windowOpenState;
    messageFlowWindowOpen.output = 2;
    messageFlowWindowOpen.updateAdditionalAttribute("ha_action", ha_action);

    this.debounce(messageFlowWindowOpen);
  }

  private sendAction(
    heatmode: string,
    isExplicitCommand: boolean = false,
  ): void {
    if (!this.active) {
      return;
    }

    if (this.windowOpenState) {
      this.activateFrostProtection();
      return;
    }

    const modeChangeAllowed =
      isExplicitCommand || this.automaticModeSelectionAllowed;

    if (heatmode && modeChangeAllowed) {
      this.activeHeatmode = heatmode;
      this.debounce(
        new NodeMessageFlow({ topic: "heatmode", payload: heatmode }, 0),
      );
    }

    const effectiveMode = this.activeHeatmode || heatmode;
    const baseTargetTemperature =
      this.determineBaseTargetTemperature(effectiveMode);

    if (baseTargetTemperature < 0) {
      return;
    }

    let targetTemperature = baseTargetTemperature;
    if (this.config.pvBoostEnabled && this.pvBoost) {
      targetTemperature += Number(this.config.pvBoostTemperatureOffset);
    }

    if (this.config.controllerMode === HeatingControllerControllerMode.mpc) {
      const mpcResult = this.mpcController.compute(targetTemperature);
      if (mpcResult === null) {
        this.sendTemperatureForAllTrvs(targetTemperature);
      } else {
        mpcResult.trvTargets.forEach((trvTarget, index) => {
          this.debounce(
            new NodeMessageFlow(
              {
                topic: this.config.trvs[index]?.name ?? `trv${index + 1}`,
                payload: trvTarget,
              },
              1,
            ),
          );
        });
      }
    } else {
      this.debounce(
        new NodeMessageFlow(
          { topic: "target_temperature", payload: targetTemperature },
          1,
        ),
      );
    }
  }

  private activateFrostProtection() {
    const frostMode = this.config.frostProtectionCommand;
    if (frostMode) {
      this.debounce(
        new NodeMessageFlow({ topic: "heatmode", payload: frostMode }, 0),
      );
    }
    const frostTemp = this.roundTemperatureToStep(
      this.config.frostProtectionTemperature,
    );
    this.sendTemperatureForAllTrvs(frostTemp);
  }

  private determineBaseTargetTemperature(
    heatmode: string = this.activeHeatmode,
  ): number {
    switch (heatmode) {
      case this.config.comfortCommand:
        return this.comfortTemperature;
      case this.config.ecoCommand:
        return this.comfortTemperature + this.ecoTemperatureOffset;
      case this.config.boostCommand:
        return this.comfortTemperature + this.config.boostTemperatureOffset;
      case this.config.frostProtectionCommand:
        return this.config.frostProtectionTemperature;
      default:
        return -1;
    }
  }

  sendTemperatureForAllTrvs(temperature: number) {
    const topics: string[] = [];
    if (this.config.trvs.length === 0) {
      topics.push("target_temperature");
    } else {
      for (
        let i = 0;
        i < Math.min(this.config.trvs.length, TRV_MAX_COUNT);
        i++
      ) {
        topics.push(`${this.config.trvs[i].name}`);
      }
    }

    topics.forEach((topic) => {
      this.debounce(new NodeMessageFlow({ topic, payload: temperature }, 1));
    });
  }

  roundTemperatureToStep(temperature: number) {
    const step = this.config.targetTemperatureStep;
    return Math.round(temperature / step) * step;
  }

  protected updateStatusAfterDebounce(messageFlow: NodeMessageFlow): void {
    if (messageFlow.output === 0) {
      this.lastsend = messageFlow.payload;
    }
    this.triggerNodeStatus();
  }

  protected statusColor(status: any): NodeStatusFill {
    if (!this.active) {
      return "red";
    }
    if (status === null) {
      return "grey";
    }
    if (this.windowOpenState) {
      return "blue";
    }
    if (this.blocked) {
      return "red";
    }
    return "green";
  }

  protected statusTextFormatter(status: any): string {
    if (!this.active) {
      return this.RED._("helper.heating-controller.state.inactive");
    }

    let text: string;
    if (status === null) {
      text = "Unknown";
    } else if (this.windowOpenState) {
      text = this.RED._("helper.heating-controller.state.windowOpen");
    } else if (this.blocked) {
      text = this.RED._("helper.heating-controller.state.automationOff");
    } else {
      text = this.RED._("helper.heating-controller.state.automationOn");
    }

    const displayMode = this.windowOpenState
      ? this.config.frostProtectionCommand
      : this.activeHeatmode;
    const baseTargetTemperature =
      this.determineBaseTargetTemperature(displayMode);

    if (baseTargetTemperature >= 0) {
      const effectiveTargetTemperature =
        !this.windowOpenState && this.config.pvBoostEnabled && this.pvBoost
          ? baseTargetTemperature + Number(this.config.pvBoostTemperatureOffset)
          : baseTargetTemperature;

      text += " - " + displayMode;
      text += " (" + effectiveTargetTemperature + " °C";

      if (!this.windowOpenState && this.config.pvBoostEnabled && this.pvBoost) {
        text += " +☀️";
      }

      const roomTemperature = this.mpcController.getRoomTemperature();
      if (roomTemperature !== null) {
        text +=
          " / " +
          this.RED._("helper.heating-controller.state.room") +
          " " +
          roomTemperature.toFixed(1) +
          " °C";
      }

      text += ")";
    } else {
      text += " - Unknown";
    }

    return text;
  }
}
