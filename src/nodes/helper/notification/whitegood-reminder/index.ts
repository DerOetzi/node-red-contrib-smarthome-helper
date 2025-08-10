import { Node, NodeAPI, NodeStatusFill } from "node-red";
import { convertToMilliseconds } from "../../../../helpers/time.helper";
import { NodeMessageFlow, NodeStatus } from "../../../flowctrl/base/types";
import MatchJoinNode from "../../../flowctrl/match-join";
import { NodeCategory } from "../../../types";
import {
  HelperNotificationCategory,
  NotifyMessageType,
  NotifyNodeMessageFlow,
} from "../types";
import {
  WhitegoodReminderNodeDef,
  WhitegoodReminderNodeOptions,
  WhitegoodReminderNodeOptionsDefaults,
  WhitegoodReminderTarget,
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

  private timer: NodeJS.Timeout | null = null;
  private reminderCount: number = 0;

  constructor(RED: NodeAPI, node: Node, config: WhitegoodReminderNodeDef) {
    super(RED, node, config, WhitegoodReminderNodeOptionsDefaults);
  }

  protected matched(messageFlow: NodeMessageFlow): void {
    switch (messageFlow.topic) {
      case WhitegoodReminderTarget.power:
        this.checkPower(messageFlow);
        break;
      case WhitegoodReminderTarget.runs:
        this.runs = messageFlow.payload as number;
        this.triggerNodeStatus();
        break;
      case WhitegoodReminderTarget.emptied:
        if (messageFlow.payload as boolean) {
          if (this.nodeStatus === WhitegoodStatus.running) {
            this.runs += 1;
          }

          this.clearTimer();
          this.nodeStatus = WhitegoodStatus.off;
        }
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

  private checkPower(messageFlow: NodeMessageFlow): void {
    const power = messageFlow.payload as number;
    if (power < this.config.offPowerLimit) {
      this.finish(messageFlow);
    } else if (power > this.config.standbyPowerLimit) {
      this.clearTimer();
      this.nodeStatus = WhitegoodStatus.running;
    } else if (this.nodeStatus === WhitegoodStatus.off) {
      this.nodeStatus = WhitegoodStatus.standby;
    }
  }

  private finish(messageFlow: NodeMessageFlow): void {
    if (this.nodeStatus === WhitegoodStatus.running) {
      this.runs += 1;

      this.sendReminder(messageFlow);

      const runningMessageFlow = messageFlow.clone();
      runningMessageFlow.topic = "whitegoodRuns";
      runningMessageFlow.payload = this.runs;
      runningMessageFlow.output = 1;

      this.debounce(runningMessageFlow);

      if (this.config.emptyReminderEnabled) {
        delete messageFlow.send;
        this.setTimer(messageFlow);
        this.nodeStatus = WhitegoodStatus.unemptied;
      } else {
        this.nodeStatus = WhitegoodStatus.off;
      }
    } else if (this.nodeStatus !== WhitegoodStatus.unemptied) {
      this.nodeStatus = WhitegoodStatus.off;
    }
  }

  private setTimer(messageFlow: NodeMessageFlow): void {
    if (this.timer) {
      this.clearTimer();
    }

    this.timer = setInterval(
      () => {
        this.sendReminder(messageFlow);
      },
      convertToMilliseconds(
        this.config.emptyReminderInterval,
        this.config.emptyReminderUnit
      )
    );
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.reminderCount = 0;
  }

  private sendReminder(messageFlow: NodeMessageFlow) {
    let message = this.cleanupNeeded
      ? this.RED._("helper.whitegood-reminder.notify.cleanupMessage")
      : this.RED._("helper.whitegood-reminder.notify.message");

    message = message.replace("{name}", this.config.name);

    const whitegoodReminderMessageFlow = NotifyNodeMessageFlow.clone(
      messageFlow,
      "reminder",
      {
        title: this.RED._("helper.whitegood-reminder.notify.title"),
        message,
        type: NotifyMessageType.reminderHomeOrFirstAll,
        reminderCount: this.reminderCount++,
      }
    );

    this.debounce(whitegoodReminderMessageFlow);
  }

  protected updateStatusAfterDebounce(_: NodeMessageFlow): void {
    //Do Nothing
  }

  protected statusColor(status: NodeStatus): NodeStatusFill {
    let color: NodeStatusFill;

    switch (status) {
      case WhitegoodStatus.off:
        color = "red";
        break;
      case WhitegoodStatus.standby:
      case WhitegoodStatus.unemptied:
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
