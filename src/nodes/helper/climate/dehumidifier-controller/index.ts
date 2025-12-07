import { Node, NodeAPI } from "node-red";
import { convertToMilliseconds } from "../../../../helpers/time.helper";
import { NodeMessageFlow } from "../../../flowctrl/base/types";
import MatchJoinNode from "../../../flowctrl/match-join";
import { NodeCategory } from "../../../types";
import { HelperClimateCategory } from "../types";
import {
  DehumidifierControllerNodeDef,
  DehumidifierControllerNodeInputs,
  DehumidifierControllerNodeOptions,
  DehumidifierControllerNodeOptionsDefaults,
  DehumidifierControllerTarget,
} from "./types";
import { LogicalOperation } from "../../../logical/op";

export default class DehumidifierControllerNode extends MatchJoinNode<
  DehumidifierControllerNodeDef,
  DehumidifierControllerNodeOptions
> {
  protected static readonly _nodeCategory: NodeCategory = HelperClimateCategory;
  protected static readonly _nodeType: string = "dehumidifier-controller";

  private readonly inputs: DehumidifierControllerNodeInputs = {
    nightMode: false,
    absenceMode: false,
    compressorActive: false,
    windowOpen: {},
  };

  private targetHumidity?: number;
  private humidityShouldRun: boolean = false;

  private compressorProtectionTimer: NodeJS.Timeout | null = null;

  constructor(RED: NodeAPI, node: Node, config: DehumidifierControllerNodeDef) {
    super(RED, node, config, DehumidifierControllerNodeOptionsDefaults);
  }

  protected matched(messageFlow: NodeMessageFlow): void {
    const topic = messageFlow.topic;

    switch (topic) {
      case DehumidifierControllerTarget.humidity:
        this.inputs.humidity = messageFlow.payloadAsNumber();
        break;
      case DehumidifierControllerTarget.temperature:
        this.inputs.temperature = messageFlow.payloadAsNumber();
        break;
      case DehumidifierControllerTarget.nightMode:
        this.inputs.nightMode = messageFlow.payloadAsBoolean(false);
        break;
      case DehumidifierControllerTarget.absenceMode:
        this.inputs.absenceMode = messageFlow.payloadAsBoolean(false);
        break;
      case DehumidifierControllerTarget.compressorActive: {
        this.inputs.compressorActive = messageFlow.payloadAsBoolean(false);
        break;
      }
      case DehumidifierControllerTarget.windowOpen:
        this.inputs.windowOpen[messageFlow.originalTopic || "window"] =
          messageFlow.payloadAsBoolean(false);

        break;
    }

    if (
      this.inputs.humidity === undefined ||
      this.inputs.temperature === undefined
    ) {
      return;
    }

    this.calculateHumidityState();

    this.sendNewState(this.shouldRun);
  }

  private get shouldRun() {
    return this.humidityShouldRun && !this.isWindowOpen;
  }

  private get isWindowOpen(): boolean {
    return LogicalOperation.or(Object.values(this.inputs.windowOpen));
  }

  private calculateHumidityState(): void {
    if (
      this.inputs.humidity === undefined ||
      this.inputs.temperature === undefined
    ) {
      return;
    }

    let targetHumidity = this.config.baseTarget;

    targetHumidity += (20 - this.inputs.temperature) * this.config.tempSlope;

    if (this.inputs.nightMode) {
      targetHumidity += 3;
    }

    if (this.inputs.absenceMode) {
      targetHumidity -= 5;
    }

    this.targetHumidity = Math.max(
      this.config.minHumidity,
      Math.min(this.config.maxHumidity, targetHumidity)
    );

    if (this.inputs.humidity < this.targetHumidity - this.config.hysteresis) {
      this.humidityShouldRun = false;
    } else if (
      this.inputs.humidity >
      this.targetHumidity + this.config.hysteresis
    ) {
      this.humidityShouldRun = true;
    }
  }

  private sendNewState(
    shouldRun: boolean,
    messageFlow?: NodeMessageFlow
  ): void {
    if (this.compressorProtectionTimer) {
      return;
    }

    if (!shouldRun && this.inputs.compressorActive) {
      return;
    }

    if (this.nodeStatus === shouldRun) {
      return;
    }

    const sendMessageFlow =
      messageFlow?.clone() ||
      new NodeMessageFlow({ topic: "dehumidifierState" }, 0);

    sendMessageFlow.payload = shouldRun;

    sendMessageFlow.updateAdditionalAttribute(
      "targetHumidity",
      this.targetHumidity
    );
    sendMessageFlow.updateAdditionalAttribute("windowOpen", this.isWindowOpen);

    this.debounce(sendMessageFlow);
  }

  protected updateStatusAfterDebounce(messageFlow: NodeMessageFlow): void {
    this.nodeStatus = messageFlow.payloadAsBoolean(false);
    this.startCompressorProtectionTimer(this.nodeStatus);
  }

  private startCompressorProtectionTimer(shouldRun: boolean): void {
    const protectionTime = shouldRun
      ? convertToMilliseconds(this.config.minOnTime, this.config.minOnTimeUnit)
      : convertToMilliseconds(
          this.config.minOffTime,
          this.config.minOffTimeUnit
        );

    this.compressorProtectionTimer = setTimeout(() => {
      this.compressorProtectionTimer = null;
      this.sendNewState(this.shouldRun);
    }, protectionTime);
  }
}
