import { Node, NodeAPI } from "node-red";
import { convertToMilliseconds } from "../../../../helpers/time.helper";
import MatchJoinNode from "../../../flowctrl/match-join";
import { MatchJoinNodeData } from "../../../flowctrl/match-join/types";
import { NodeCategory } from "../../../types";
import {
  HelperNotificationCategory,
  NotifyMessage,
  NotifyNodeMessage,
} from "../types";
import {
  MoistureAlertNodeDef,
  MoistureAlertNodeOptions,
  MoistureAlertNodeOptionsDefaults,
} from "./types";
import { BaseNodeDebounceData, NodeStatus } from "nodes/flowctrl/base/types";

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

    const message = this.RED._("helper.moisture-alert.notify.message");

    this.notify = {
      title: this.RED._("helper.moisture-alert.notify.title"),
      message: message.replace("{name}", this.config.name),
    };
  }

  protected matched(data: MatchJoinNodeData): void {
    const msg = data.msg;
    const topic = msg.topic as string;
    const payload = msg.payload as number;

    switch (topic) {
      case "moisture":
        if (this.lastMoisture > -1) {
          if (payload < this.config.alertThreshold && this.checkInterval()) {
            this.debounce({
              msg: {
                topic: "moisture",
                notify: this.notify,
              } as NotifyNodeMessage,
            });
            this.lastAlert = Date.now();

            this.sendMsg(
              { topic: "lastAlert" },
              {
                payload: Math.round(this.lastAlert / 1000),
                output: 1,
              }
            );
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

  protected updateStatusAfterDebounce(_: BaseNodeDebounceData): void {
    this.triggerNodeStatus();
  }

  protected statusTextFormatter(status: NodeStatus): string {
    let statusText = this.lastMoisture + " % - ";

    statusText += this.RED._(
      `helper.moisture-alert.status.${status ? "ok" : "alert"}`
    );

    return statusText;
  }
}
