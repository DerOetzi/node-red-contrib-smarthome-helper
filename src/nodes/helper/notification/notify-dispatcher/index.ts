import { Node, NodeAPI } from "node-red";
import { NodeMessageFlow } from "nodes/flowctrl/base/types";
import MatchJoinNode from "../../../flowctrl/match-join";
import { NodeCategory } from "../../../types";
import { HelperNotificationCategory, NotifyNodeMessage } from "../types";
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

    let broadcast = !(notify.onlyAtHome ?? false);

    if (!broadcast) {
      broadcast = true;

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
