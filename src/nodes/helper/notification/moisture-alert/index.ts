import { Node, NodeAPI } from "node-red";
import { convertToMilliseconds } from "../../../../helpers/time.helper";
import { NodeMessageFlow, NodeStatus } from "../../../flowctrl/base/types";
import MatchJoinNode from "../../../flowctrl/match-join";
import { NodeCategory } from "../../../types";
import {
  HelperNotificationCategory,
  NotifyMessage,
  NotifyMessageType,
  NotifyNodeMessageFlow,
} from "../types";
import {
  MoistureAlertNodeDef,
  MoistureAlertNodeOptions,
  MoistureAlertNodeOptionsDefaults,
} from "./types";

export default class MoistureAlertNode extends MatchJoinNode<
  MoistureAlertNodeDef,
  MoistureAlertNodeOptions
> {
  protected static readonly _nodeCategory: NodeCategory =
    HelperNotificationCategory;
  protected static readonly _nodeType: string = "moisture-alert";

  private lastMoisture: number = -1;
  private lastAlert: number = -1;

  private readonly alertInterval: number;
  private readonly notify: NotifyMessage;

  constructor(RED: NodeAPI, node: Node, config: MoistureAlertNodeDef) {
    super(RED, node, config, MoistureAlertNodeOptionsDefaults);

    this.alertInterval = convertToMilliseconds(
      this.config.alertInterval,
      this.config.alertIntervalUnit
    );

    const message = this.RED._("helper.moisture-alert.notification.message");

    this.notify = {
      title: this.RED._("helper.moisture-alert.notification.title"),
      message: message.replace("{name}", this.config.name),
      type: NotifyMessageType.reminderHomeOrAll
    };
  }

  protected matched(messageFlow: NodeMessageFlow): void {
    const topic = messageFlow.topic as string;
    const payload = messageFlow.payload as number;

    switch (topic) {
      case "moisture":
        if (this.lastMoisture > -1) {
          if (payload < this.config.alertThreshold && this.checkInterval()) {
            const moistureMessageFlow = NotifyNodeMessageFlow.clone(
              messageFlow,
              "moisture",
              this.notify
            );

            this.debounce(moistureMessageFlow);
            this.lastAlert = Date.now();

            const lastAlertMessageFlow = messageFlow.clone();
            lastAlertMessageFlow.topic = "lastAlert";
            lastAlertMessageFlow.payload = Math.round(this.lastAlert / 1000);
            lastAlertMessageFlow.output = 1;

            this.sendMsg(lastAlertMessageFlow);
          }
        }
        this.lastMoisture = payload;
        break;
      case "lastAlert":
        this.lastAlert = payload * 1000;
        break;
    }

    this.nodeStatus =
      this.lastMoisture > -1 && this.lastMoisture >= this.config.alertThreshold;
  }

  private checkInterval(): boolean {
    const check =
      this.lastAlert > -1 && Date.now() - this.lastAlert > this.alertInterval;

    if (this.lastAlert === -1) {
      this.lastAlert = 0;
    }

    return check;
  }

  protected updateStatusAfterDebounce(_: NodeMessageFlow): void {
    this.triggerNodeStatus();
  }

  protected statusTextFormatter(status: NodeStatus): string {
    let statusText = this.lastMoisture + " % - ";

    statusText += this.RED._(
      `helper.moisture-alert.state.${status ? "ok" : "alert"}`
    );

    return statusText;
  }
}
