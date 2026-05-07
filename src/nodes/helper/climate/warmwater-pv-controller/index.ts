import { NodeAPI, Node, NodeStatusFill } from "node-red";
import ActiveControllerNode from "../../../flowctrl/active-controller";
import { NodeCategory } from "../../../types";
import { HelperClimateCategory } from "../types";
import {
  WarmWaterPVControllerNodeDef,
  WarmWaterPVControllerNodeOptions,
  WarmWaterPVControllerNodeOptionsDefaults,
  WarmWaterPVControllerTarget,
} from "./types";
import { NodeMessageFlow } from "../../../flowctrl/base/types";
import { convertToMilliseconds } from "../../../../helpers/time.helper";
import Migration from "../../../flowctrl/base/migration";
import WarmWaterPVControllerMigration from "./migration";
import { ActiveControllerTarget } from "../../../flowctrl/active-controller/types";

export default class WarmWaterPVControllerNode extends ActiveControllerNode<
  WarmWaterPVControllerNodeDef,
  WarmWaterPVControllerNodeOptions
> {
  protected static readonly _nodeCategory: NodeCategory = HelperClimateCategory;
  protected static readonly _nodeType: string = "warmwater-pv-controller";
  protected static readonly _migration: Migration<any> =
    new WarmWaterPVControllerMigration();

  private gridDelivery: number | undefined = undefined;
  private batterySOC: number | undefined = undefined;
  private outsideTemperature: number | undefined = undefined;
  private currentWaterTemperature: number | undefined = undefined;

  /** Timer for stabilizing the upper grid threshold (rising-flank guard) */
  private gridUpperStabilizeTimer: NodeJS.Timeout | null = null;
  private gridUpperStable: boolean = false;

  constructor(RED: NodeAPI, node: Node, config: WarmWaterPVControllerNodeDef) {
    super(RED, node, config, WarmWaterPVControllerNodeOptionsDefaults);
  }

  protected onClose(): void {
    super.onClose();
    this.clearGridUpperTimer();
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
      case WarmWaterPVControllerTarget.gridDelivery:
        this.handleGridDelivery(messageFlow.payloadAsNumber(0) ?? 0);
        this.evaluateAndSend();
        break;
      case WarmWaterPVControllerTarget.batterySOC:
        this.batterySOC = messageFlow.payloadAsNumber(0) ?? 0;
        this.evaluateAndSend();
        break;
      case WarmWaterPVControllerTarget.outsideTemperature:
        this.outsideTemperature = messageFlow.payloadAsNumber();
        this.evaluateAndSend();
        break;
      case WarmWaterPVControllerTarget.currentWaterTemperature:
        this.currentWaterTemperature = messageFlow.payloadAsNumber();
        this.evaluateAndSend();
        break;
    }
  }

  protected onReactivate(): void {
    this.evaluateAndSend();
  }

  protected onCommand(_message: NodeMessageFlow): void {
    this.evaluateAndSend();
  }

  protected onManualControl(manual: any): void {
    this.sendMode(!!manual);
  }

  private handleGridDelivery(value: number): void {
    this.gridDelivery = value;

    const upperMet = value >= this.config.gridUpperThreshold;

    if (upperMet && !this.gridUpperStable && !this.gridUpperStabilizeTimer) {
      this.gridUpperStabilizeTimer = setTimeout(
        () => {
          this.gridUpperStabilizeTimer = null;
          this.gridUpperStable = true;
          this.evaluateAndSend();
        },
        convertToMilliseconds(
          this.config.gridStabilizeTime,
          this.config.gridStabilizeUnit,
        ),
      );
    } else if (!upperMet) {
      this.clearGridUpperTimer();
      this.gridUpperStable = false;
    }
  }

  private clearGridUpperTimer(): void {
    if (this.gridUpperStabilizeTimer) {
      clearTimeout(this.gridUpperStabilizeTimer);
      this.gridUpperStabilizeTimer = null;
    }
  }

  private evaluateAndSend(): void {
    if (!this.active || this.blocked) {
      return;
    }
    this.sendMode(this.isSurplusMode());
  }

  private buildDecisionDebug(): Record<string, any> {
    return {
      gridDelivery: this.gridDelivery,
      gridLowerThreshold: this.config.gridLowerThreshold,
      gridUpperThreshold: this.config.gridUpperThreshold,
      gridUpperStable: this.gridUpperStable,
      batterySOCEnabled: this.config.batterySOCEnabled,
      batterySOC: this.batterySOC,
      batterySOCThreshold: this.config.batterySOCThreshold,
      outsideTemperature: this.outsideTemperature,
      outsideTempLowerThreshold: this.config.outsideTempLowerThreshold,
      outsideTempUpperThreshold: this.config.outsideTempUpperThreshold,
      currentTempEnabled: this.config.currentTempEnabled,
      currentWaterTemperature: this.currentWaterTemperature,
      currentTempThreshold: this.config.currentTempThreshold,
    };
  }

  private sendMode(isSurplus: boolean): void {
    const outputValue = this.resolveValue(
      isSurplus ? this.config.surplusValue : this.config.normalValue,
      isSurplus ? this.config.surplusValueType : this.config.normalValueType,
    );

    const outFlow = new NodeMessageFlow(
      { topic: "operationMode", payload: outputValue },
      0,
    );
    outFlow.updateAdditionalAttribute("conditions", this.buildDecisionDebug());
    this.debounce(outFlow);

    const targetTemperature = isSurplus
      ? this.config.surplusTemperature
      : this.config.normalTemperature;

    const tempFlow = new NodeMessageFlow(
      { topic: "targetTemperature", payload: targetTemperature },
      1,
    );
    this.debounce(tempFlow);
  }

  private resolveValue(value: string, valueType: string): boolean | string {
    if (valueType === "bool") {
      return value === "true";
    }
    return value;
  }

  private isSurplusMode(): boolean {
    // Grid lower threshold must be met
    if (
      this.gridDelivery === undefined ||
      this.gridDelivery < this.config.gridLowerThreshold
    ) {
      return false;
    }

    if (this.config.batterySOCEnabled) {
      if (
        this.batterySOC === undefined ||
        this.batterySOC < this.config.batterySOCThreshold
      ) {
        return false;
      }
    }

    if (this.config.currentTempEnabled) {
      if (
        this.currentWaterTemperature === undefined ||
        this.currentWaterTemperature < this.config.currentTempThreshold
      ) {
        return false;
      }
    }

    const summerCondition =
      this.outsideTemperature !== undefined &&
      this.outsideTemperature >= this.config.outsideTempUpperThreshold;

    const shoulderCondition =
      this.gridUpperStable &&
      this.outsideTemperature !== undefined &&
      this.outsideTemperature >= this.config.outsideTempLowerThreshold;

    return summerCondition || shoulderCondition;
  }

  protected updateStatusAfterDebounce(messageFlow: NodeMessageFlow): void {
    if (messageFlow.output === 0) {
      this.lastsend = messageFlow.payload;
    }
    this.triggerNodeStatus();
  }

  protected statusColor(status: any): NodeStatusFill {
    if (!this.active || this.blocked) {
      return "red";
    }

    if (status === null) {
      return "grey";
    }

    return "green";
  }

  protected statusTextFormatter(status: any): string {
    if (!this.active) {
      return this.RED._("helper.warmwater-pv-controller.status.inactive");
    }

    if (this.blocked) {
      return this.RED._("helper.warmwater-pv-controller.status.blocked");
    }

    if (status === null) {
      return this.RED._("helper.warmwater-pv-controller.status.unknown");
    }

    return this.isSurplusMode()
      ? this.RED._("helper.warmwater-pv-controller.status.surplus")
      : this.RED._("helper.warmwater-pv-controller.status.normal");
  }
}
