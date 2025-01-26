import { Node, NodeAPI } from "node-red";
import { convertToMilliseconds } from "../../../../helpers/time.helper";
import { BaseNodeDebounceData } from "../../../flowctrl/base/types";
import MatchJoinNode from "../../../flowctrl/match-join";
import { MatchJoinNodeData } from "../../../flowctrl/match-join/types";
import { LogicalOperation } from "../../../logical/op";
import { NodeCategory } from "../../../types";
import {
  HelperNotificationCategory,
  NotifyMessage,
  NotifyNodeMessage,
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

  constructor(RED: NodeAPI, node: Node, config: WindowReminderNodeDef) {
    super(RED, node, config, WindowReminderNodeOptionsDefaults);
  }

  protected matched(data: MatchJoinNodeData): void {
    const msg = data.msg;

    if (msg.topic === WindowReminderTarget.window) {
      this.windows[msg.originalTopic] = msg.payload as boolean;
      if (this.isWindowOpen()) {
        this.setTimer();
        if (!this.presence) {
          this.sendMsg({
            topic: "alarm",
            notify: this.prepareNotification("alarm"),
          } as NotifyNodeMessage);
        }
      } else {
        this.clearTimer();
      }
    } else if (msg.topic === WindowReminderTarget.presence) {
      this.presence = msg.payload as boolean;
      if (this.isWindowOpen() && !this.presence) {
        this.sendMsg({
          topic: "leaving",
          notify: this.prepareNotification("leaving"),
        } as NotifyNodeMessage);
      }
    }

    this.nodeStatus = this.isWindowOpen();
  }

  private isWindowOpen(): boolean {
    return LogicalOperation.or(Object.values(this.windows));
  }

  private setTimer(): void {
    this.clearTimer();
    const notification = this.prepareNotification("normal", true);
    if (this.config.interval > 0) {
      this.timer = setInterval(
        () => {
          this.debounce({
            msg: {
              topic: "reminder",
              notify: notification,
            } as NotifyNodeMessage,
          });
        },
        convertToMilliseconds(this.config.interval, this.config.intervalUnit)
      );
    }
  }

  protected updateStatusAfterDebounce(_: BaseNodeDebounceData): void {
    this.nodeStatus = this.isWindowOpen();
  }

  private prepareNotification(
    messageIdentifier: "normal" | "alarm" | "leaving",
    onlyAtHome: boolean = false
  ): NotifyMessage {
    return {
      title: this.RED._("helper.window-reminder.notification.title"),
      message: this.RED._(
        `helper.window-reminder.notification.${messageIdentifier}`
      )
        .replace("{windowName}", this.config.name)
        .replace("  ", " "),
      onlyAtHome: onlyAtHome,
    };
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
