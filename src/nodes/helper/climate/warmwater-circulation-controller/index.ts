import { Node, NodeAPI, NodeStatusFill } from "node-red";
import {
  convertToMilliseconds,
  TimeIntervalUnit,
} from "../../../../helpers/time.helper";
import ActiveControllerNode from "../../../flowctrl/active-controller";
import { ActiveControllerTarget } from "../../../flowctrl/active-controller/types";
import Migration from "../../../flowctrl/base/migration";
import { NodeMessageFlow } from "../../../flowctrl/base/types";
import { NodeCategory } from "../../../types";
import { HelperClimateCategory } from "../types";
import WarmwaterCirculationControllerMigration from "./migration";
import { WarmwaterCirculationStateController } from "./state";
import {
  WarmwaterCirculationControllerNodeDef,
  WarmwaterCirculationControllerNodeOptions,
  WarmwaterCirculationControllerNodeOptionsDefaults,
  WarmwaterCirculationControllerTarget,
} from "./types";

export default class WarmwaterCirculationControllerNode extends ActiveControllerNode<
  WarmwaterCirculationControllerNodeDef,
  WarmwaterCirculationControllerNodeOptions
> {
  protected static readonly _nodeCategory: NodeCategory = HelperClimateCategory;
  protected static readonly _nodeType: string =
    "warmwater-circulation-controller";
  protected static readonly _migration: Migration<any> =
    new WarmwaterCirculationControllerMigration();

  private readonly stateController = new WarmwaterCirculationStateController();
  private intervalTimer: NodeJS.Timeout | null = null;
  private intervalPumpOn: boolean | null = null;
  private specialReleaseOffTimer: NodeJS.Timeout | null = null;

  constructor(
    RED: NodeAPI,
    node: Node,
    config: WarmwaterCirculationControllerNodeDef,
  ) {
    super(RED, node, config, WarmwaterCirculationControllerNodeOptionsDefaults);
  }

  protected onClose(): void {
    super.onClose();
    this.stopAllTimers();
    this.stateController.reset();
  }

  protected matched(messageFlow: NodeMessageFlow): void {
    switch (messageFlow.topic) {
      case ActiveControllerTarget.activeCondition:
        this.handleActivateTarget(messageFlow);
        break;
      case WarmwaterCirculationControllerTarget.heatingAvailable:
        this.handleHeatingAvailable(messageFlow);
        break;
      case WarmwaterCirculationControllerTarget.runCondition:
        this.handleRunCondition(messageFlow);
        break;
      case WarmwaterCirculationControllerTarget.specialRelease:
        this.handleSpecialRelease(messageFlow);
        break;
    }
  }

  protected onReactivate(): void {
    this.evaluateAndApply();
  }

  protected onCommand(): void {}

  protected onManualControl(): void {}

  private handleHeatingAvailable(messageFlow: NodeMessageFlow): void {
    this.stateController.setHeatingAvailable(
      messageFlow.payloadAsBoolean(false),
    );
    this.evaluateAndApply();
  }

  private handleRunCondition(messageFlow: NodeMessageFlow): void {
    this.stateController.setRunCondition(messageFlow);
    this.evaluateAndApply();
  }

  private handleSpecialRelease(messageFlow: NodeMessageFlow): void {
    const wasActive = this.stateController.isSpecialReleaseActive;

    this.stateController.setSpecialRelease(messageFlow);

    if (wasActive && !this.stateController.isSpecialReleaseActive) {
      this.startSpecialReleaseOffDelay();
    }

    this.evaluateAndApply();
  }

  private startSpecialReleaseOffDelay(): void {
    this.clearSpecialReleaseOffTimer();
    const delayMs = convertToMilliseconds(
      this.config.specialReleaseOffDelay,
      this.config.specialReleaseOffDelayUnit,
    );

    this.specialReleaseOffTimer = setTimeout(() => {
      this.specialReleaseOffTimer = null;
      this.evaluateAndApply();
    }, delayMs);
  }

  private evaluateAndApply(): void {
    if (!this.active) {
      return;
    }

    if (!this.stateController.isHeatingAvailable) {
      this.stopAllTimers();
      this.emitPump(false);
      return;
    }

    if (this.stateController.isSpecialReleaseActive) {
      this.clearSpecialReleaseOffTimer();
      this.stopIntervalTimer();
      this.emitPump(true);
      return;
    }

    if (this.specialReleaseOffTimer) {
      this.stopIntervalTimer();
      this.emitPump(true);
      return;
    }

    if (!this.stateController.isRunAllowed) {
      this.stopAllTimers();
      this.emitPump(false);
      return;
    }

    if (!this.intervalTimer) {
      this.startIntervalLoop();
    }
  }

  private startIntervalLoop(): void {
    this.runIntervalStep(true);
  }

  private runIntervalStep(pumpOn: boolean): void {
    this.intervalPumpOn = pumpOn;
    this.emitPump(pumpOn);

    const cfg = this.getActiveIntervalConfig(new Date());
    const delayMs = pumpOn
      ? convertToMilliseconds(cfg.onTime, cfg.onTimeUnit)
      : convertToMilliseconds(cfg.offTime, cfg.offTimeUnit);

    this.intervalTimer = setTimeout(() => {
      this.intervalTimer = null;
      if (
        this.active &&
        this.stateController.isHeatingAvailable &&
        this.stateController.isRunAllowed &&
        !this.stateController.isSpecialReleaseActive &&
        !this.specialReleaseOffTimer
      ) {
        this.runIntervalStep(!pumpOn);
      }
    }, delayMs);
  }

  private getActiveIntervalConfig(now: Date): {
    onTime: number;
    onTimeUnit: TimeIntervalUnit;
    offTime: number;
    offTimeUnit: TimeIntervalUnit;
  } {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const interval of this.config.intervals) {
      const [fh, fm] = interval.from.split(":").map(Number);
      const [th, tm] = interval.to.split(":").map(Number);
      const fromMinutes = fh * 60 + fm;
      const toMinutes = th * 60 + tm;

      if (currentMinutes >= fromMinutes && currentMinutes < toMinutes) {
        return interval;
      }
    }

    return {
      onTime: this.config.defaultOnTime,
      onTimeUnit: this.config.defaultOnTimeUnit,
      offTime: this.config.defaultOffTime,
      offTimeUnit: this.config.defaultOffTimeUnit,
    };
  }

  private emitPump(on: boolean): void {
    const flow = new NodeMessageFlow({ topic: "pump", payload: on }, 0);

    this.debounce(flow);
  }

  private stopAllTimers(): void {
    this.stopIntervalTimer();
    this.clearSpecialReleaseOffTimer();
  }

  private stopIntervalTimer(): void {
    if (this.intervalTimer) {
      clearTimeout(this.intervalTimer);
      this.intervalTimer = null;
    }
    this.intervalPumpOn = null;
  }

  private clearSpecialReleaseOffTimer(): void {
    if (this.specialReleaseOffTimer) {
      clearTimeout(this.specialReleaseOffTimer);
      this.specialReleaseOffTimer = null;
    }
  }

  protected updateStatusAfterDebounce(messageFlow: NodeMessageFlow): void {
    (this.lastsend as any) = messageFlow.payload;
    this.triggerNodeStatus();
  }

  protected statusColor(_status: any): NodeStatusFill {
    if (!this.active) {
      return "red";
    }

    if (!this.stateController.isHeatingAvailable) {
      return "grey";
    }

    if (
      this.stateController.isSpecialReleaseActive ||
      this.specialReleaseOffTimer
    ) {
      return "yellow";
    }

    return (this.lastsend as any) === true ? "green" : "blue";
  }

  protected statusTextFormatter(_status: any): string {
    const statusKey = this.resolveStatusKey();
    return this.RED._(
      `helper.warmwater-circulation-controller.status.${statusKey}`,
    );
  }

  private resolveStatusKey(): string {
    if (!this.active) {
      return "inactive";
    }
    if (!this.stateController.isHeatingAvailable) {
      return "heating-unavailable";
    }
    if (this.stateController.isSpecialReleaseActive) {
      return "special-release";
    }
    if (this.specialReleaseOffTimer) {
      return "special-release-off-delay";
    }
    if (!this.stateController.isRunAllowed) {
      return "waiting-run-condition";
    }

    if (this.intervalPumpOn !== null) {
      return (this.lastsend as any) === true ? "interval-on" : "interval-off";
    }
    return "waiting-run-condition";
  }
}
