import { Node, NodeStatusFill } from "node-red";
import { RED } from "../../../globals";
import { comparators } from "../../logical/compare/operations";
import { NodeType } from "../../types";
import BaseNode from "../base";
import {
  defaultMatchJoinNodeConfig,
  MatchJoinNodeConfig,
  MatchJoinNodeType,
} from "./types";
import { BaseNodeOptions } from "../base/types";

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

  public onInput(msg: any, send: any, done: any) {
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
      msg.topic = targetValue;
    }

    if (matcher || !this.config.discardNotMatched) {
      if (this.config.join) {
        this.messages[msg.topic] = msg.payload;

        if (Object.keys(this.messages).length >= this.config.minMsgCount) {
          this.debounce({
            received_msg: msg,
            send,
            result: this.messages,
          });
        } else {
          this.nodeStatus = "waiting";
        }
      } else {
        this.debounce({ received_msg: msg, send, result: msg.payload });
      }
    }

    if (done) {
      done();
    }
  }

  protected debounceListener(data: any) {
    let sendOptions = {
      send: data.send,
      payload: data.result,
    };

    this.sendMsg(data.received_msg, sendOptions);
    this.nodeStatus = new Date();
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
