import { Node, NodeAPI, NodeStatusFill } from "node-red";
import { NodeMessageFlow, NodeStatus } from "../../../flowctrl/base/types";
import MatchJoinNode from "../../../flowctrl/match-join";
import { NodeCategory } from "../../../types";
import {
  HelperNotificationCategory,
  NotifyMessageType,
  NotifyNodeMessageFlow,
} from "../types";
import {
  WasteReminderNodeDef,
  WasteReminderNodeOptions,
  WasteReminderNodeOptionsDefaults,
  WasteReminderTarget,
} from "./types";

export default class WasteReminderNode extends MatchJoinNode<
  WasteReminderNodeDef,
  WasteReminderNodeOptions
> {
  protected static readonly _nodeCategory: NodeCategory =
    HelperNotificationCategory;
  protected static readonly _nodeType: string = "waste-reminder";

  private _types: string[] = [];

  constructor(RED: NodeAPI, node: Node, config: WasteReminderNodeDef) {
    super(RED, node, config, WasteReminderNodeOptionsDefaults);
  }

  protected matched(messageFlow: NodeMessageFlow): void {
    switch (messageFlow.topic) {
      case WasteReminderTarget.types:
        this.setTypes(messageFlow);
        break;
      case WasteReminderTarget.remaining:
        this.checkRemaining(messageFlow);
        break;
    }
  }

  private setTypes(messageFlow: NodeMessageFlow) {
    if (typeof messageFlow.payload === "object") {
      this._types = messageFlow.payload as string[];
    } else {
      let typesString = (messageFlow.payload as string).trim();
      if (typesString.startsWith("[")) {
        typesString = typesString.replace(/'/g, '"');
        this._types = JSON.parse(typesString);
      } else {
        this._types = typesString.split(",").map((type) => type.trim());
      }
    }

    this.triggerNodeStatus();
  }

  private checkRemaining(messageFlow: NodeMessageFlow): void {
    const remaining = messageFlow.payload as number;
    if (remaining <= 1) {
      let message =
        this._types.length <= 1
          ? this.RED._("helper.waste-reminder.notification.message")
          : this.RED._("helper.waste-reminder.notification.messagePlural");

      message = message.replace("{waste}", this.typesFormatted());

      const wasteReminderMessageFlow = NotifyNodeMessageFlow.clone(
        messageFlow,
        "waste-reminder",
        {
          title: this.RED._("helper.waste-reminder.notification.title"),
          message,
          type: NotifyMessageType.reminderAll,
        }
      );

      this.debounce(wasteReminderMessageFlow);
    }

    this.nodeStatus = remaining;
  }

  protected statusColor(status: NodeStatus): NodeStatusFill {
    let color: NodeStatusFill = "red";

    if (status === 1) {
      color = "green";
    }

    return color;
  }

  protected statusTextFormatter(status: NodeStatus): string {
    return this.typesFormatted() + " (" + status + " days)";
  }

  private typesFormatted(): string {
    let typesString = this.RED._("helper.waste-reminder.types.no-waste");

    if (this._types.length === 1) {
      typesString = this._types[0];
    } else if (this._types.length > 1) {
      const lastData = this._types[this._types.length - 1];
      const types = this._types.slice(0, -1);
      typesString =
        types.join(", ") +
        " " +
        this.RED._("helper.waste-reminder.types.and") +
        " " +
        lastData;
    }

    return typesString;
  }
}
