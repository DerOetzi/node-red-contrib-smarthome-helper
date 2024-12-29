import { Node, NodeStatusFill } from "node-red";
import { RED } from "../../../globals";
import { NodeRedDone, NodeRedSend } from "../../../types";
import { comparators } from "../../logical/compare/operations";
import { NodeType } from "../../types";
import BaseNode from "../base";
import { BaseNodeOptions } from "../base/types";
import {
  defaultMatchJoinNodeConfig,
  MatchJoinNodeConfig,
  MatchJoinNodeData,
  MatchJoinNodeMessage,
  MatchJoinNodeType,
} from "./types";

export default class MatchJoinNode<
  T extends MatchJoinNodeConfig = MatchJoinNodeConfig,
> extends BaseNode<T> {
  private messages: Record<string, any> = {};

  static get type(): NodeType {
    return MatchJoinNodeType;
  }

  constructor(
    node: Node,
    config: MatchJoinNodeConfig,
    options: BaseNodeOptions = {}
  ) {
    config = { ...defaultMatchJoinNodeConfig, ...config };
    if (config.join) {
      options = {
        filterkey: "filterMessages",
      };
    }
    super(node, config as T, options);
  }

  protected onClose() {
    super.onClose();
    this.messages = {};
  }

  public onInput(
    msg: MatchJoinNodeMessage,
    send: NodeRedSend,
    done: NodeRedDone
  ) {
    const matcher = this.config.matchers.find((matcher) => {
      const propertyValue = RED.util.getMessageProperty(msg, matcher.property);
      const compareValue = RED.util.evaluateNodeProperty(
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
      const targetValue = RED.util.evaluateNodeProperty(
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

  protected statusColor(status: any): NodeStatusFill {
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
