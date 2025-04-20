import { Node, NodeAPI, NodeStatusFill } from "node-red";
import { CompareOperation } from "../../logical/compare";
import { NodeCategory } from "../../types";
import BaseNode from "../base";
import { BaseCategory, NodeMessageFlow, NodeStatus } from "../base/types";
import {
  MatchJoinNodeDef,
  MatchJoinNodeOptions,
  MatchJoinNodeOptionsDefaults,
} from "./types";

export default class MatchJoinNode<
  T extends MatchJoinNodeDef = MatchJoinNodeDef,
  U extends MatchJoinNodeOptions = MatchJoinNodeOptions,
> extends BaseNode<T, U> {
  protected static readonly _nodeCategory: NodeCategory = BaseCategory;
  protected static readonly _nodeType: string = "match-join";

  private messages: Record<string, any> = {};

  constructor(
    RED: NodeAPI,
    node: Node,
    config: T,
    defaultConfig: U = MatchJoinNodeOptionsDefaults as U
  ) {
    super(RED, node, config, defaultConfig);
  }

  protected onClose() {
    super.onClose();
    this.messages = {};
  }

  public input(messageFlow: NodeMessageFlow) {
    const matcher = this.config.matchers.find((matcher) => {
      const propertyValue = this.RED.util.getMessageProperty(
        messageFlow.originalMsg,
        matcher.property
      );
      const compareValue = this.RED.util.evaluateNodeProperty(
        matcher.compare,
        matcher.compareType,
        this.node,
        messageFlow.originalMsg
      );

      const result = CompareOperation.func(
        matcher.operation,
        propertyValue,
        compareValue
      );

      return result;
    });

    if (matcher || !this.config.discardNotMatched) {
      if (matcher) {
        messageFlow.topic = this.RED.util.evaluateNodeProperty(
          matcher.target,
          matcher.targetType,
          this.node,
          messageFlow.originalMsg
        );
      }

      if (this.config.join) {
        if (!messageFlow.topic) {
          this.node.error("No topic set for message");
          return;
        }

        this.messages[messageFlow.topic] = messageFlow.payload;

        if (Object.keys(this.messages).length >= this.config.minMsgCount) {
          messageFlow.payload = this.messages;
          messageFlow.updateAdditionalAttribute("input", this.messages);
          this.matched(messageFlow);
        } else {
          this.nodeStatus = "waiting";
        }
      } else {
        messageFlow.updateAdditionalAttribute("input", messageFlow.payload);
        this.matched(messageFlow);
      }
    }
  }

  protected matched(messageFlow: NodeMessageFlow) {
    this.debounce(messageFlow);
  }

  protected statusColor(status: NodeStatus): NodeStatusFill {
    let color: NodeStatusFill = "red";
    if (status === null || status === undefined || status === "") {
      color = "grey";
    } else if (status === "waiting") {
      color = "yellow";
    } else if (status) {
      color = "green";
    }

    return color;
  }
}
