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
  MpcInput,
  MpcParams,
  MpcState,
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

  private trvTemperatures: Record<string, number> = {};
  private additionalTemperatureSensorValue?: number;
  private outdoorTemperature?: number;

  private mpcState: MpcState = {};

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
    this.trvTemperatures = {};
    this.additionalTemperatureSensorValue = undefined;
    this.outdoorTemperature = undefined;
    this.mpcState = {};
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
      case HeatingControllerTarget.trvTemperature: {
        const trvKey = messageFlow.originalTopic ?? "trv";
        const trvValue = messageFlow.payloadAsNumber();
        if (trvValue !== undefined) {
          this.trvTemperatures[trvKey] = trvValue;
          this.sendAction(this.lastsend);
        }
        break;
      }
      case HeatingControllerTarget.additionalTemperatureSensor: {
        const sensorValue = messageFlow.payloadAsNumber();
        if (sensorValue !== undefined) {
          this.additionalTemperatureSensorValue = sensorValue;
          this.sendAction(this.lastsend);
        }
        break;
      }
      case HeatingControllerTarget.outdoorTemperature: {
        const outdoorValue = messageFlow.payloadAsNumber();
        if (outdoorValue !== undefined) {
          this.outdoorTemperature = outdoorValue;
          this.sendAction(this.lastsend);
        }
        break;
      }
    }
  }

  protected onReactivate(): void {
    this.handleComfortCondition();
  }

  protected onCommand(messageFlow: NodeMessageFlow): void {
    this.handleCommand(messageFlow.originalMsg);
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

    const baseTargetTemperature = this.determineBaseSetpoint(heatmode);

    if (baseTargetTemperature < 0) {
      return;
    }

    let targetTemperature: number;

    if (this.config.controllerMode === HeatingControllerControllerMode.mpc) {
      targetTemperature = this.computeMpcTargetTemperature(
        baseTargetTemperature,
        ignoreBlocked,
      );
    } else {
      targetTemperature = baseTargetTemperature;
      if (this.config.pvBoostEnabled && this.pvBoost) {
        targetTemperature += Number(this.config.pvBoostTemperatureOffset);
      }
    }

    const messageFlowTemperature = new NodeMessageFlow(
      { topic: "target_temperature", payload: targetTemperature },
      1,
    );
    this.debounce(messageFlowTemperature);
  }

  private computeMpcTargetTemperature(
    baseTargetTemperature: number,
    ignoreBlocked: boolean,
  ): number {
    const windowOpen = LogicalOperation.or(Object.values(this.windowsStates));
    const heatingAllowed = (!this.blocked || ignoreBlocked) && !windowOpen;

    const roomTemperature = this.determineRoomTemperature();

    if (roomTemperature === null) {
      return baseTargetTemperature;
    }

    const mpcInput = this.buildMpcInput(
      baseTargetTemperature,
      roomTemperature,
      windowOpen,
      heatingAllowed,
    );

    if (!heatingAllowed) {
      return this.config.frostProtectionTemperature;
    }

    const demandPct = this.computeMpcDemand(mpcInput);
    this.mpcState.lastPercent = demandPct;
    this.mpcState.lastUpdateTs = mpcInput.nowTs;

    const referenceTrvTemperature = this.determineReferenceTrvTemperature();
    const mapped = this.mapDemandToTargetTemperature(
      demandPct,
      referenceTrvTemperature,
    );
    const rounded = this.roundTargetTemperature(mapped);

    this.mpcState.lastTargetTemperature = rounded;
    return rounded;
  }

  private determineBaseSetpoint(heatmode: string): number {
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

  private determineRoomTemperature(): number | null {
    if (this.additionalTemperatureSensorValue !== undefined) {
      return this.additionalTemperatureSensorValue;
    }

    const trvValues = Object.values(this.trvTemperatures);
    if (trvValues.length >= 2) {
      return trvValues.reduce((a, b) => a + b, 0) / trvValues.length;
    }

    if (trvValues.length === 1) {
      return trvValues[0];
    }

    return null;
  }

  private determineReferenceTrvTemperature(): number | null {
    const trvValues = Object.values(this.trvTemperatures);
    if (trvValues.length >= 2) {
      return trvValues.reduce((a, b) => a + b, 0) / trvValues.length;
    }

    if (trvValues.length === 1) {
      return trvValues[0];
    }

    return this.determineRoomTemperature();
  }

  private buildMpcInput(
    baseTarget: number,
    roomTempC: number,
    windowOpen: boolean,
    heatingAllowed: boolean,
  ): MpcInput {
    return {
      targetTempC: baseTarget,
      roomTempC,
      referenceTrvTempC: this.determineReferenceTrvTemperature() ?? undefined,
      outdoorTempC: this.outdoorTemperature,
      windowOpen,
      heatingAllowed,
      nowTs: Date.now(),
    };
  }

  private computeMpcDemand(input: MpcInput): number {
    const params = this.buildMpcParams();
    const candidates = Array.from({ length: 21 }, (_, i) => i * 5);

    let bestCandidate = 0;
    let bestCost = Infinity;

    for (const candidate of candidates) {
      const cost = this.evaluateCandidate(input, candidate, params);
      if (cost < bestCost) {
        bestCost = cost;
        bestCandidate = candidate;
      }
    }

    return bestCandidate;
  }

  private evaluateCandidate(
    input: MpcInput,
    demandPct: number,
    params: MpcParams,
  ): number {
    let predictedTemp = input.roomTempC;
    let totalCost = 0;

    for (let step = 0; step < params.horizonSteps; step++) {
      predictedTemp = this.simulateTemperature(
        predictedTemp,
        demandPct,
        input.outdoorTempC,
        params,
      );
      totalCost += Math.pow(input.targetTempC - predictedTemp, 2);
    }

    const lastPercent = this.mpcState.lastPercent ?? demandPct;
    totalCost += Math.abs(demandPct - lastPercent) * params.changePenalty;

    return totalCost;
  }

  private simulateTemperature(
    currentTemp: number,
    demandPct: number,
    outdoorTempC: number | undefined,
    params: MpcParams,
  ): number {
    const heating = params.thermalGain * (demandPct / 100) * params.stepMinutes;
    let loss: number;

    if (outdoorTempC === undefined) {
      loss = params.lossCoeff * params.stepMinutes;
    } else {
      loss = Math.max(
        0,
        params.lossCoeff * (currentTemp - outdoorTempC) * params.stepMinutes,
      );
    }

    return currentTemp + heating - loss;
  }

  private buildMpcParams(): MpcParams {
    return {
      stepMinutes: this.config.mpcStepMinutes,
      horizonSteps: this.config.mpcHorizonSteps,
      thermalGain: this.config.mpcThermalGain,
      lossCoeff: this.config.mpcLossCoeff,
      changePenalty: this.config.mpcChangePenalty,
      minTargetTemperature: this.config.minTargetTemperature,
      maxTargetTemperature: this.config.maxTargetTemperature,
      targetTemperatureStep: this.config.targetTemperatureStep,
    };
  }

  private mapDemandToTargetTemperature(
    demandPct: number,
    referenceTrvTemp: number | null,
  ): number {
    const referenceTemp =
      referenceTrvTemp ??
      this.determineRoomTemperature() ??
      this.config.minTargetTemperature;
    const { minTargetTemperature, maxTargetTemperature } = this.config;

    let mapped: number;

    if (demandPct === 0) {
      mapped = referenceTemp - 1;
    } else {
      mapped =
        referenceTemp +
        (maxTargetTemperature - referenceTemp) * (demandPct / 100);
    }

    return Math.max(
      minTargetTemperature,
      Math.min(maxTargetTemperature, mapped),
    );
  }

  private roundTargetTemperature(temp: number): number {
    const step = this.config.targetTemperatureStep;
    return Math.round(temp / step) * step;
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

    const baseTargetTemperature = this.determineBaseSetpoint(this.lastsend);

    if (baseTargetTemperature >= 0) {
      text += " - " + this.lastsend;
      text += " (" + baseTargetTemperature + " °C";

      if (
        this.config.controllerMode === HeatingControllerControllerMode.static &&
        this.config.pvBoostEnabled &&
        this.pvBoost
      ) {
        text += " +☀️";
      }

      const roomTemperature = this.determineRoomTemperature();
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
