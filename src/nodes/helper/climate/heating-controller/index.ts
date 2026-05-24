import { Node, NodeAPI, NodeStatusFill } from "node-red";
import { NodeMessageFlow } from "../../../flowctrl/base/types";
import ActiveControllerNode from "../../../flowctrl/active-controller";
import { ActiveControllerTarget } from "../../../flowctrl/active-controller/types";
import { NodeCategory } from "../../../types";
import { HelperClimateCategory } from "../types";
import {
  HeatingControllerControllerMode,
  HeatingControllerNodeDef,
  HeatingControllerNodeOptions,
  HeatingControllerNodeOptionsDefaults,
  HeatingControllerTarget,
} from "./types";
import Migration from "../../../flowctrl/base/migration";
import HeatingControllerMigration from "./migration";
import { RoomMPCController } from "./mpc";
import {
  PersistedLearningFactors,
  PERSISTENCE_VERSION,
  TRV_MAX_COUNT,
  TrvIndex,
} from "./mpc/types";
import {
  convertToMilliseconds,
  TimeIntervalUnit,
} from "../../../../helpers/time.helper";
import { HeatingStateController } from "./state";
import {
  RoomMpcComputeResult,
  RoomMpcLogLevel,
  RoomMpcResult,
} from "./mpc/results";

export default class HeatingControllerNode extends ActiveControllerNode<
  HeatingControllerNodeDef,
  HeatingControllerNodeOptions
> {
  protected static readonly _nodeCategory: NodeCategory = HelperClimateCategory;
  protected static readonly _nodeType: string = "heating-controller";
  protected static readonly _migration: Migration<any> =
    new HeatingControllerMigration();

  private readonly mpcController: RoomMPCController;
  private readonly stateController: HeatingStateController;

  private manualFallbackOverrideActive: boolean = false;

  constructor(RED: NodeAPI, node: Node, config: HeatingControllerNodeDef) {
    super(RED, node, config, HeatingControllerNodeOptionsDefaults);
    this.stateController = new HeatingStateController(this.config);
    this.mpcController = new RoomMPCController(config);
    this.handleComfortCondition();
  }

  protected onClose(): void {
    super.onClose();
    this.manualFallbackOverrideActive = false;
    this.stateController.reset();
    this.mpcController.destroy();
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
        this.handleNumberUpdate(messageFlow, (value) =>
          this.stateController.setComfortTemperature(value),
        );
        break;
      case HeatingControllerTarget.ecoTemperatureOffset:
        this.handleNumberUpdate(messageFlow, (value) =>
          this.stateController.setEcoTemperatureOffset(value),
        );
        break;
      case HeatingControllerTarget.pvBoost:
        this.handleControlBooleanUpdate(messageFlow, false, (value) =>
          this.stateController.setPvBoost(value),
        );
        break;
      case HeatingControllerTarget.windowOpen:
        this.handleWindowOpen(messageFlow);
        break;
      case HeatingControllerTarget.heatingAvailable:
        this.handleHeatingAvailable(messageFlow);
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
      case HeatingControllerTarget.mpcLearningRecalibrate:
        this.handleMPCLearningRecalibrate(messageFlow);
        break;
    }
  }

  protected onReactivate(): void {
    this.handleComfortCondition();
  }

  protected onCommand(messageFlow: NodeMessageFlow): void {
    this.clearManualFallbackOverrideIfAutomaticModeAvailable();
    const msg = messageFlow.originalMsg;
    if (msg?.heatmode) {
      const heatmode = this.stateController.mapHeatmodeCommand(
        msg.heatmode as string,
      );
      this.sendAction(heatmode, true);
    } else {
      this.handleComfortCondition();
    }
  }

  protected onManualControl(manual: any) {
    this.clearManualFallbackOverrideIfAutomaticModeAvailable();
    this.sendAction(manual, true);
  }

  private handleComfortConditionTarget(messageFlow: NodeMessageFlow): void {
    this.stateController.setComfortCondition(
      messageFlow.originalTopic,
      messageFlow.payload as boolean,
    );
    this.handleComfortCondition();
  }

  private handleWindowOpen(messageFlow: NodeMessageFlow) {
    const { previous, current } = this.stateController.updateWindowState(
      messageFlow.originalTopic,
      messageFlow.payload as boolean,
    );

    let ha_action = "";

    if (current) {
      this.mpcController.suppressLearningForInterval(
        convertToMilliseconds(1, TimeIntervalUnit.h),
      );
      this.sendAction(this.config.frostProtectionCommand);
      ha_action = "switch.turn_on";
    } else {
      if (previous) {
        this.mpcController.suppressLearningForInterval(
          convertToMilliseconds(30, TimeIntervalUnit.m),
        );
      }

      if (this.automaticModeSelectionAllowed) {
        this.handleComfortCondition();
      } else if (this.stateController.currentHeatmode) {
        this.sendAction(this.stateController.currentHeatmode);
      }
      ha_action = "switch.turn_off";
    }

    const messageFlowWindowOpen = messageFlow.clone();
    messageFlowWindowOpen.payload = current;
    messageFlowWindowOpen.output = 2;
    messageFlowWindowOpen.updateAdditionalAttribute("ha_action", ha_action);

    this.debounce(messageFlowWindowOpen);
  }

  private handleHeatingAvailable(messageFlow: NodeMessageFlow) {
    this.handleControlBooleanUpdate(messageFlow, false, (value) => {
      this.stateController.setHeatingAvailable(value);
      value
        ? this.mpcController.enableLearning()
        : this.mpcController.disableLearning();
    });
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
    this.sendAction(this.stateController.currentHeatmode);
  }

  private handleControlBooleanUpdate(
    messageFlow: NodeMessageFlow,
    defaultValue: boolean,
    applyUpdate: (value: boolean) => void,
  ): void {
    const value = messageFlow.payloadAsBoolean(defaultValue);
    applyUpdate(value);
    this.sendAction(this.stateController.currentHeatmode);
  }

  private handleMPCLearningRecalibrate(messageFlow: NodeMessageFlow): void {
    const input = messageFlow.payload;
    if (this.isValidPersistedLearningFactors(input)) {
      const uaFactor =
        typeof input.uaFactor === "string"
          ? Number.parseFloat(input.uaFactor)
          : input.uaFactor;
      const capacityFactor =
        typeof input.capacityFactor === "string"
          ? Number.parseFloat(input.capacityFactor)
          : input.capacityFactor;

      const persistedLearningFactors = new PersistedLearningFactors(
        {
          uaFactor,
          capacityFactor,
        },
        PERSISTENCE_VERSION,
      );
      this.mpcController.recalibrateLearningFactors(persistedLearningFactors);
    } else {
      this.node.error(
        "Invalid payload for MPC learning recalibration",
        messageFlow.originalMsg,
      );
    }
  }

  private isValidPersistedLearningFactors(
    persistedLearningFactors: PersistedLearningFactors | undefined,
  ) {
    return (
      persistedLearningFactors &&
      typeof persistedLearningFactors === "object" &&
      Number.isInteger(persistedLearningFactors.version) &&
      persistedLearningFactors.version === PERSISTENCE_VERSION &&
      this.isNumeric(persistedLearningFactors.uaFactor) &&
      this.isNumeric(persistedLearningFactors.capacityFactor)
    );
  }

  private isNumeric(value: any): boolean {
    return (
      (typeof value === "number" && Number.isFinite(value)) ||
      (typeof value === "string" &&
        !Number.isNaN(Number.parseFloat(value)) &&
        Number.isFinite(Number.parseFloat(value)))
    );
  }

  private handleComfortCondition(): void {
    this.clearManualFallbackOverrideIfAutomaticModeAvailable();
    if (this.automaticModeSelectionAllowed) {
      const desiredHeatmode = this.stateController.desiredAutomaticHeatmode(
        this.active,
        this.blocked,
      );
      this.sendAction(desiredHeatmode);
    }
  }

  private clearManualFallbackOverrideIfAutomaticModeAvailable(): void {
    if (this.automaticModeSelectionAllowed) {
      this.manualFallbackOverrideActive = false;
    }
  }

  private sendAction(
    heatmode: string,
    isExplicitCommand: boolean = false,
  ): void {
    if (!this.active) {
      return;
    }

    if (isExplicitCommand && heatmode !== this.config.frostProtectionCommand) {
      this.manualFallbackOverrideActive = true;
    }

    if (
      !this.manualFallbackOverrideActive &&
      this.stateController.shouldForceFrostProtection()
    ) {
      this.activateFrostProtection();
      return;
    }

    const modeChangeAllowed =
      isExplicitCommand || this.automaticModeSelectionAllowed;

    if (heatmode && modeChangeAllowed) {
      this.stateController.setActiveHeatmode(heatmode);
      this.debounce(
        new NodeMessageFlow({ topic: "heatmode", payload: heatmode }, 0),
      );
    }

    const effectiveMode = this.stateController.currentHeatmode || heatmode;
    const baseTargetTemperature =
      this.stateController.determineBaseTargetTemperature(effectiveMode);

    if (baseTargetTemperature === null) {
      return;
    }

    const targetTemperature = this.stateController.effectiveTargetTemperature(
      baseTargetTemperature,
    );

    if (this.config.controllerMode === HeatingControllerControllerMode.mpc) {
      const mpcComputeResult = this.mpcController.compute(targetTemperature);
      this.handleMPCResult(mpcComputeResult, targetTemperature);
    } else {
      this.sendTemperature("target_temperature", targetTemperature, 0);
    }
  }

  private activateFrostProtection() {
    const frostMode = this.config.frostProtectionCommand;
    if (frostMode) {
      this.debouncePass(
        new NodeMessageFlow({ topic: "heatmode", payload: frostMode }, 0),
      );
    }

    const frostProtectionTemperature = this.config.frostProtectionTemperature;

    if (this.config.controllerMode === HeatingControllerControllerMode.mpc) {
      const frostMpcComputeResult = this.mpcController.compute(
        frostProtectionTemperature,
      );
      this.handleMPCResult(
        frostMpcComputeResult,
        frostProtectionTemperature,
        true,
      );
      return;
    }

    this.sendTemperatureForAllTrvs(frostProtectionTemperature, true);
  }

  private get automaticModeSelectionAllowed(): boolean {
    return this.stateController.automaticModeSelectionAllowed(
      this.active,
      this.blocked,
    );
  }

  private handleMPCResult(
    mpcComputeResult: RoomMpcComputeResult,
    targetTemperature: number,
    frostProtection: boolean = false,
  ): void {
    if (mpcComputeResult.valid) {
      const mpcResult = mpcComputeResult.result;
      mpcResult.trvTargets.forEach((trvTarget, index) => {
        this.sendTemperature(
          this.config.trvs[index]?.name ?? `trv${index + 1}`,
          trvTarget,
          index as TrvIndex,
          mpcResult,
          true,
        );
      });

      this.handleMPCPersistLearning();
    } else {
      switch (RoomMpcLogLevel[mpcComputeResult.error.code]) {
        case "error":
          this.node.error(
            `MPC computation failed: ${mpcComputeResult.error.message} (code: ${mpcComputeResult.error.code})`,
          );
          break;
        case "warn":
          this.node.warn(
            `MPC computation warning: ${mpcComputeResult.error.message} (code: ${mpcComputeResult.error.code})`,
          );
          break;
        case "info":
          this.node.log(
            `MPC computation info: ${mpcComputeResult.error.message} (code: ${mpcComputeResult.error.code})`,
          );
          break;
      }

      this.sendTemperatureForAllTrvs(targetTemperature, frostProtection);
    }
  }

  private handleMPCPersistLearning() {
    const persist = this.mpcController.consumePersistedLearningFactors();
    if (persist) {
      const flow = new NodeMessageFlow(
        {
          topic: "persistLearningFactors",
          payload: {
            version: persist.version,
            uaFactor: persist.uaFactor,
            capacityFactor: persist.capacityFactor,
          },
        },
        3,
      );

      flow.updateAdditionalAttribute("uaFactor", persist.uaFactor);
      flow.updateAdditionalAttribute("capacityFactor", persist.capacityFactor);

      this.debouncePass(flow);
    }
  }

  private sendTemperatureForAllTrvs(
    temperature: number,
    frostProtection: boolean = false,
  ) {
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

    topics.forEach((topic, index) => {
      this.sendTemperature(
        topic,
        temperature,
        index as TrvIndex,
        null,
        frostProtection,
      );
    });
  }

  private sendTemperature(
    topic: string,
    temperature: number,
    trvIndex: TrvIndex,
    mpcResult: RoomMpcResult | null = null,
    skipDebounce: boolean = false,
  ): void {
    const flow = new NodeMessageFlow({ topic, payload: temperature }, 1);
    flow.updateAdditionalAttribute("trv", trvIndex);

    if (trvIndex === 0 && mpcResult !== null) {
      flow.updateAdditionalAttributes(mpcResult.getMpcAdditionalAttributes());
    }

    if (skipDebounce) {
      this.debouncePass(flow);
    } else {
      this.debounce(flow);
    }
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
    if (status === null || !this.stateController) {
      return "grey";
    }
    if (this.stateController.isWindowOpen) {
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

    if (!this.stateController) {
      return this.RED._("helper.heating-controller.state.initializing");
    }

    const text = this.resolveStateText(status);

    const displayMode =
      this.manualFallbackOverrideActive && this.stateController?.currentHeatmode
        ? this.stateController.currentHeatmode
        : this.stateController.resolveDisplayMode();
    const baseTargetTemperature =
      this.stateController.determineBaseTargetTemperature(displayMode);

    if (baseTargetTemperature !== null) {
      return (
        text + this.formatTemperatureDetails(displayMode, baseTargetTemperature)
      );
    }

    return text + " - Unknown";
  }

  private resolveStateText(status: any): string {
    if (status === null) {
      return "Unknown";
    } else if (this.stateController.isWindowOpen) {
      return this.RED._("helper.heating-controller.state.windowOpen");
    } else if (!this.stateController.isHeatingAvailable) {
      return this.RED._("helper.heating-controller.state.heatingUnavailable");
    } else if (this.blocked) {
      return this.RED._("helper.heating-controller.state.automationOff");
    }
    return this.RED._("helper.heating-controller.state.automationOn");
  }

  private formatTemperatureDetails(
    displayMode: string,
    baseTargetTemperature: number,
  ): string {
    const pvBoostActive =
      !this.stateController.isWindowOpen &&
      this.stateController.isPvBoostActive;
    const effectiveTargetTemperature =
      this.stateController.effectiveTargetTemperature(baseTargetTemperature);

    let detail = " - " + displayMode;
    detail += " (" + effectiveTargetTemperature + " °C";

    if (pvBoostActive) {
      detail += " +☀️";
    }

    detail += ")";
    return detail;
  }
}
