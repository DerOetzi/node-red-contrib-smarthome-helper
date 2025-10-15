import { Node, NodeAPI } from "node-red";
import Migration from "../../../flowctrl/base/migration";
import { NodeMessageFlow } from "../../../flowctrl/base/types";
import MatchJoinNode from "../../../flowctrl/match-join";
import { NodeCategory } from "../../../types";
import {
  HelperNotificationCategory,
  NotifyMessageType,
  NotifyNodeMessage,
} from "../types";
import NotifyDispatcherMigration from "./migration";
import {
  NotifyDispatcherNodeDef,
  NotifyDispatcherNodeOptions,
  NotifyDispatcherNodeOptionsDefaults,
  NotifyDispatcherPersonMetadata,
  NotifyDispatcherTarget,
} from "./types";

export default class NotifyDispatcherNode extends MatchJoinNode<
  NotifyDispatcherNodeDef,
  NotifyDispatcherNodeOptions
> {
  protected static readonly _nodeCategory: NodeCategory =
    HelperNotificationCategory;
  protected static readonly _nodeType = "notify-dispatcher";
  protected static readonly _migration: Migration<any> =
    new NotifyDispatcherMigration();

  private personStates: Partial<Record<NotifyDispatcherTarget, boolean>> = {};

  constructor(RED: NodeAPI, node: Node, config: NotifyDispatcherNodeDef) {
    super(RED, node, config, NotifyDispatcherNodeOptionsDefaults);
  }

  protected matched(messageFlow: NodeMessageFlow): void {
    if (messageFlow.topic === NotifyDispatcherTarget.message) {
      this.dispatchMessage(messageFlow);
    } else if (this.isPersonTarget(messageFlow.topic as string)) {
      this.personStates[messageFlow.topic as NotifyDispatcherTarget] =
        messageFlow.payload as boolean;
    }
  }

  private dispatchMessage(messageFlow: NodeMessageFlow) {
    const msg = messageFlow.originalMsg as NotifyNodeMessage;
    const notify = msg.notify;
    messageFlow.payload = notify;
    const messageType = notify.type ?? NotifyMessageType.reminderAll;

    let broadcast = [
      NotifyMessageType.alert,
      NotifyMessageType.reminderAll,
    ].includes(messageType);

    if (!broadcast) {
      broadcast =
        NotifyMessageType.reminderHomeOrAll === messageType ||
        (NotifyMessageType.reminderHomeOrFirstAll == messageType &&
          (notify.reminderCount ?? 0) < 1);

      for (const [key, value] of Object.entries(this.personStates)) {
        if (value) {
          const metadata =
            NotifyDispatcherPersonMetadata[key as NotifyDispatcherTarget];
          messageFlow.output = metadata.output;
          broadcast = false;
          this.debounce(messageFlow);
        }
      }
    }

    if (broadcast) {
      messageFlow.output = 0;
      this.debounce(messageFlow);
    }
  }

  private isPersonTarget(target: string): boolean {
    return (
      Object.values(NotifyDispatcherTarget).includes(
        target as NotifyDispatcherTarget
      ) && target.startsWith("person")
    );
  }
}
