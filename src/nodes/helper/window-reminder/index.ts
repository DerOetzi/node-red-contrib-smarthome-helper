import { Node } from "node-red";
import { RED } from "../../../globals";
import { BaseNodeDebounceData } from "../../flowctrl/base/types";
import MatchJoinNode from "../../flowctrl/match-join";
import { NodeType } from "../../types";
import {
  NotifyDispatcherNodeMessage,
  NotifyMessage,
} from "../notify-dispatcher/types";
import {
  defaultWindowReminderNodeConfig,
  WindowReminderNodeConfig,
  WindowReminderNodeType,
} from "./types";
import { MatchJoinNodeData } from "../../flowctrl/match-join/types";
import NotifyDispatcherNode from "../notify-dispatcher";

export default class WindowReminderNode extends MatchJoinNode<WindowReminderNodeConfig> {
  private timer: NodeJS.Timeout | null = null;

  constructor(node: Node, config: WindowReminderNodeConfig) {
    config = { ...defaultWindowReminderNodeConfig, ...config };
    super(node, config);
  }

  static get type(): NodeType {
    return WindowReminderNodeType;
  }

  protected matched(data: MatchJoinNodeData): void {
    const trigger = data.msg.topic;
    const window = data.payload.window;
    const presence = data.payload.presence;

    if (trigger === "window") {
      if (window === true) {
        this.setTimer();
        if (presence === false) {
          this.sendMsg({
            topic: "alarm",
            notify: this.prepareNotification("alarm"),
          } as NotifyDispatcherNodeMessage);
        }
      } else {
        this.clearTimer();
      }
    } else if (trigger === "presence" && window) {
      if (presence === false) {
        this.sendMsg({
          topic: "leaving",
          notify: this.prepareNotification("leaving"),
        } as NotifyDispatcherNodeMessage);
      }
    }

    this.nodeStatus = window;
  }

  private setTimer(): void {
    this.clearTimer();
    const notification = this.prepareNotification("normal", true);
    if (this.config.interval > 0) {
      this.timer = setInterval(() => {
        this.debounce({
          msg: {
            topic: "reminder",
            notify: notification,
          } as NotifyDispatcherNodeMessage,
        });
      }, this.config.interval * 60000);
    }
  }

  private prepareNotification(
    messageIdentifier: "normal" | "alarm" | "leaving",
    onlyAtHome: boolean = false
  ): NotifyMessage {
    return {
      title: RED._("helper.window-reminder.notification.title"),
      message: RED._(
        `helper.window-reminder.notification.${messageIdentifier}`
      ).replace("{windowName}", this.config.name),
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
      status = RED._("helper.window-reminder.status.open");
    } else if (status === "false") {
      status = RED._("helper.window-reminder.status.closed");
    }

    return status;
  }
}
