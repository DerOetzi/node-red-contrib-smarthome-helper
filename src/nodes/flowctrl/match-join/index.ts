import { Node, NodeAPI, NodeStatusFill } from "node-red";
import { comparators } from "../../logical/compare/operations";
import { NodeColor, NodeDoneFunction, NodeSendFunction } from "../../types";
import BaseNode from "../base";
import { NodeStatus } from "../base/types";
import {
  MatchJoinNodeData,
  MatchJoinNodeDef,
  MatchJoinNodeMessage,
  MatchJoinNodeOptionsDefaults,
} from "./types";

export default class MatchJoinNode<
  T extends MatchJoinNodeDef = MatchJoinNodeDef,
> extends BaseNode<T> {
  public static readonly NodeType: string = "match-join";
  public static readonly NodeColor: NodeColor = NodeColor.Base;

  private messages: Record<string, any> = {};

  constructor(RED: NodeAPI, node: Node, config: T) {
    super(RED, node, config, MatchJoinNodeOptionsDefaults as T);
  }

  protected onClose() {
    super.onClose();
    this.messages = {};
  }

  public onInput(
    msg: MatchJoinNodeMessage,
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

      const comparator = comparators[matcher.operator];
      let result: boolean;
      if (comparator.propertyOnly) {
        result = comparator.func(propertyValue);
      } else {
        result = comparator.func(propertyValue, compareValue);
      }

      return result;
    });

    if (matcher) {
      const targetValue = this.RED.util.evaluateNodeProperty(
        matcher.target,
        matcher.targetType,
        this.node,
        msg
      );

      msg.originalTopic = msg.topic;
      msg.topic = targetValue;
    }

    if (matcher || !this.config.discardNotMatched) {
      if (this.config.join) {
        if (!msg.topic) {
          this.node.error("No topic set for message");
          return;
        }

        this.messages[msg.topic] = msg.payload;

        if (Object.keys(this.messages).length >= this.config.minMsgCount) {
          this.matched({
            input: this.messages,
            msg,
            send,
            payload: this.messages,
            additionalAttributes: { input: this.messages },
          });
        } else {
          this.nodeStatus = "waiting";
        }
      } else {
        //TODO Possible bug payload is not set
        this.matched({
          input: msg.payload,
          msg,
          send,
          additionalAttributes: { input: msg.payload },
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
