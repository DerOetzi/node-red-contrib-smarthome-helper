import MatchJoinNode from "@match-join";
import { MatchJoinNodeData } from "@match-join/types";
import { NodeCategory } from "@nodes/types";
import {
  HelperNotificationCategory,
  NotifyNodeMessage,
} from "@notification/types";
import { Node, NodeAPI } from "node-red";
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

  protected matched(data: MatchJoinNodeData): void {
    const msg = data.msg;

    if (msg.topic === NotifyDispatcherTarget.message) {
      this.dispatchMessage(data);
    } else if (this.isPersonTarget(msg.topic as string)) {
      this.personStates[msg.topic as NotifyDispatcherTarget] =
        msg.payload as boolean;
    }
  }

  private dispatchMessage(data: MatchJoinNodeData) {
    const msg = data.msg as NotifyNodeMessage;
    const notify = msg.notify;
    data.payload = notify;

    let broadcast = !(notify.onlyAtHome ?? false);

    if (!broadcast) {
      broadcast = true;

      for (const [key, value] of Object.entries(this.personStates)) {
        if (value) {
          const metadata =
            NotifyDispatcherPersonMetadata[key as NotifyDispatcherTarget];
          data.output = metadata.output;
          broadcast = false;
          this.debounce(data);
        }
      }
    }

    if (broadcast) {
      data.output = 0;
      this.debounce(data);
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
