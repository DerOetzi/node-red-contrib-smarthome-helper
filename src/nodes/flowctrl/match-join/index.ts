import { Node, NodeAPI, NodeMessage, NodeStatusFill } from "node-red";
import { CompareOperation } from "../../logical/compare";
import { NodeCategory, NodeDoneFunction, NodeSendFunction } from "../../types";
import BaseNode from "../base";
import { BaseCategory, NodeStatus } from "../base/types";
import {
  MatchJoinNodeData,
  MatchJoinNodeDef,
  MatchJoinNodeMessage,
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

  public onInput(
    msg: NodeMessage,
    send: NodeSendFunction,
    done: NodeDoneFunction
  ) {
    const matcher = this.config.matchers.find((matcher) => {
      const propertyValue = this.RED.util.getMessageProperty(
        msg,
        matcher.property
      );
      const compareValue = this.RED.util.evaluateNodeProperty(
        matcher.compare,
        matcher.compareType,
        this.node,
        msg
      );

      const result = CompareOperation.func(
        matcher.operation,
        propertyValue,
        compareValue
      );

      return result;
    });

    if (matcher || !this.config.discardNotMatched) {
      let matchedMsg: MatchJoinNodeMessage = {
        ...msg,
        originalTopic: msg.topic ?? "",
        input: msg.payload,
      };

      if (matcher) {
        matchedMsg.topic = this.RED.util.evaluateNodeProperty(
          matcher.target,
          matcher.targetType,
          this.node,
          msg
        );
      }

      if (this.config.join) {
        if (!msg.topic) {
          this.node.error("No topic set for message");
          return;
        }

        this.messages[msg.topic] = msg.payload;

        if (Object.keys(this.messages).length >= this.config.minMsgCount) {
          matchedMsg.input = this.messages;
          this.matched({
            msg: matchedMsg,
            send,
            payload: this.messages,
          });
        } else {
          this.nodeStatus = "waiting";
        }
      } else {
        this.matched({
          msg: matchedMsg,
          send,
          payload: msg.payload,
        });
      }
    }

    if (done) {
      done();
    }
  }

  protected matched(data: MatchJoinNodeData) {
    this.debounce(data);
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
