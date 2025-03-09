import { BaseNodeDebounceData, NodeStatus } from "@base/types";
import MatchJoinNode from "@match-join";
import { MatchJoinNodeData } from "@match-join/types";
import { NodeCategory } from "@nodes/types";
import {
  HelperNotificationCategory,
  NotifyNodeMessage,
} from "@notification/types";
import { Node, NodeAPI, NodeStatusFill } from "node-red";
import {
  WhitegoodReminderNodeDef,
  WhitegoodReminderNodeOptions,
  WhitegoodReminderNodeOptionsDefaults,
  WhitegoodStatus,
} from "./types";

export default class WhitegoodReminderNode extends MatchJoinNode<
  WhitegoodReminderNodeDef,
  WhitegoodReminderNodeOptions
> {
  protected static readonly _nodeCategory: NodeCategory =
    HelperNotificationCategory;
  protected static readonly _nodeType: string = "whitegood-reminder";

  private _runs: number = 0;
  private cleanupNeeded: boolean = false;

  constructor(RED: NodeAPI, node: Node, config: WhitegoodReminderNodeDef) {
    super(RED, node, config, WhitegoodReminderNodeOptionsDefaults);
  }

  protected matched(data: MatchJoinNodeData): void {
    switch (data.msg.topic) {
      case "power":
        this.checkPower(data);
        break;
      case "runs":
        this.runs = data.msg.payload as number;
        this.setNodeStatus(this.nodeStatus);
        break;
    }
  }

  private get runs(): number {
    return this._runs;
  }

  private set runs(value: number) {
    this._runs = value;
    this.cleanupNeeded =
      this.config.cleanupEnabled && value >= this.config.cleanupInterval;
  }

  private checkPower(data: MatchJoinNodeData): void {
    const power = data.msg.payload as number;
    if (power < this.config.offPowerLimit) {
      this.finish(data);
    } else if (power > this.config.standbyPowerLimit) {
      this.nodeStatus = WhitegoodStatus.running;
    } else if (this.nodeStatus === WhitegoodStatus.off) {
      this.nodeStatus = WhitegoodStatus.standby;
    }
  }

  private finish(data: MatchJoinNodeData): void {
    if (this.nodeStatus === WhitegoodStatus.running) {
      this.runs += 1;

      let message = this.cleanupNeeded
        ? this.RED._("helper.whitegood-reminder.notify.cleanupMessage")
        : this.RED._("helper.whitegood-reminder.notify.message");

      message = message.replace("{name}", this.config.name);

      (data.msg as NotifyNodeMessage).notify = {
        title: this.RED._("helper.whitegood-reminder.notify.title"),
        message,
        onlyAtHome: true,
      };

      this.debounce(data);

      data.msg = {
        ...data.msg,
        topic: "whitegoodRuns",
      };
      data.payload = this.runs;
      data.output = 1;

      this.debounce(data);
    }
    this.nodeStatus = WhitegoodStatus.off;
  }

  protected updateStatusAfterDebounce(_: BaseNodeDebounceData): void {
    //Do Nothing
  }

  protected statusColor(status: NodeStatus): NodeStatusFill {
    let color: NodeStatusFill;

    switch (status) {
      case WhitegoodStatus.off:
        color = "red";
        break;
      case WhitegoodStatus.standby:
        color = "yellow";
        break;
      case WhitegoodStatus.running:
        color = "green";
        break;
      default:
        color = super.statusColor(status);
    }

    return color;
  }

  protected statusTextFormatter(status: NodeStatus): string {
    status = super.statusTextFormatter(status);

    if (Object.values(WhitegoodStatus).includes(status as WhitegoodStatus)) {
      status = this.RED._("helper.whitegood-reminder.status." + status);

      if (this.cleanupNeeded) {
        status +=
          " - " + this.RED._("helper.whitegood-reminder.status.cleanup");
      }

      if (this.config.statusShowRuns) {
        status += " (" + this.runs + ")";
      }
    }

    return status;
  }
}
