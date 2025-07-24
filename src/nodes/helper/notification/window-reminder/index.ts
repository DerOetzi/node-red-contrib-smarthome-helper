import { Node, NodeAPI } from "node-red";
import { convertToMilliseconds } from "../../../../helpers/time.helper";
import { NodeMessageFlow } from "../../../flowctrl/base/types";
import MatchJoinNode from "../../../flowctrl/match-join";
import { LogicalOperation } from "../../../logical/op";
import { NodeCategory } from "../../../types";
import {
  HelperNotificationCategory,
  NotifyMessage,
  NotifyNodeMessageFlow,
} from "../types";
import {
  WindowReminderNodeDef,
  WindowReminderNodeOptions,
  WindowReminderNodeOptionsDefaults,
  WindowReminderTarget,
} from "./types";

export default class WindowReminderNode extends MatchJoinNode<
  WindowReminderNodeDef,
  WindowReminderNodeOptions
> {
  protected static readonly _nodeCategory: NodeCategory =
    HelperNotificationCategory;
  protected static readonly _nodeType: string = "window-reminder";

  private windows: Record<string, boolean> = {};
  private presence: boolean = true;
  private timer: NodeJS.Timeout | null = null;
  private intervalSelected: number = 0;

  private readonly intervals: number[];

  constructor(RED: NodeAPI, node: Node, config: WindowReminderNodeDef) {
    super(RED, node, config, WindowReminderNodeOptionsDefaults);
    this.intervals = [
      convertToMilliseconds(config.interval, config.intervalUnit),
      convertToMilliseconds(config.interval2, config.intervalUnit2),
    ];
  }

  protected matched(messageFlow: NodeMessageFlow): void {
    switch (messageFlow.topic) {
      case WindowReminderTarget.window:
        this.windows[messageFlow.originalTopic ?? "window"] =
          messageFlow.payload as boolean;
        if (this.isWindowOpen()) {
          this.setTimer(messageFlow);
          if (!this.presence) {
            const alarmMessageFlow = this.prepareNotification(
              "alarm",
              messageFlow
            );

            this.sendMsg(alarmMessageFlow);
          }
        } else {
          this.clearTimer();
        }
        break;
      case WindowReminderTarget.presence:
        this.presence = messageFlow.payload as boolean;
        if (this.isWindowOpen() && !this.presence) {
          const leavingMessageFlow = this.prepareNotification(
            "leaving",
            messageFlow
          );
          this.sendMsg(leavingMessageFlow);
        }
        break;
      case WindowReminderTarget.command:
        if (messageFlow.payload === "clear") {
          this.clearTimer();
        }
        break;
      case WindowReminderTarget.intervalSelect:
        this.intervalSelected = messageFlow.payload as number;
        break;
    }

    this.nodeStatus = this.isWindowOpen();
  }

  private isWindowOpen(): boolean {
    return LogicalOperation.or(Object.values(this.windows));
  }

  private setTimer(messageFlow: NodeMessageFlow): void {
    this.clearTimer();

    if (this.config.interval > 0) {
      const notificationMessageFlow = this.prepareNotification(
        "reminder",
        messageFlow,
        true
      );
      delete notificationMessageFlow.send;

      this.timer = setInterval(() => {
        this.debounce(notificationMessageFlow);
      }, this.intervals[this.intervalSelected]);
    }
  }

  protected updateStatusAfterDebounce(_: NodeMessageFlow): void {
    this.nodeStatus = this.isWindowOpen();
  }

  private prepareNotification(
    messageIdentifier: "reminder" | "alarm" | "leaving",
    messageFlow: NodeMessageFlow,
    onlyAtHome: boolean = false
  ): NotifyNodeMessageFlow {
    return NotifyNodeMessageFlow.clone(messageFlow, messageIdentifier, {
      title: this.RED._("helper.window-reminder.notification.title"),
      message: this.RED._(
        `helper.window-reminder.notification.${messageIdentifier}`
      )
        .replace("{windowName}", this.config.name)
        .replace("  ", " "),
      onlyAtHome: onlyAtHome,
    } as NotifyMessage);
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  protected statusTextFormatter(status: any): string {
    status = super.statusTextFormatter(status);

    if (status === "true") {
      status = this.RED._("helper.window-reminder.status.open");
    } else if (status === "false") {
      status = this.RED._("helper.window-reminder.status.closed");
    }

    return status;
  }
}
