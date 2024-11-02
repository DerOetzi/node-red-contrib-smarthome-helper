import { Node, NodeStatusFill } from "node-red";
import { RED } from "../../../globals";
import { BaseNode } from "../base";
import { defaultMatchJoinNodeConfig, MatchJoinNodeConfig } from "./types";
import { comparators } from "../../logical/compare/operations";

export class MatchJoinNode extends BaseNode<MatchJoinNodeConfig> {
  constructor(node: Node, config: MatchJoinNodeConfig) {
    config = { ...defaultMatchJoinNodeConfig, ...config };
    super(node, config);
  }

  public static create(node: Node, config: MatchJoinNodeConfig) {
    return new MatchJoinNode(node, config);
  }

  public onInput(msg: any, send: any, done: any) {
    const matchers = this.config.matchers;

    let messages = this.loadRecord("messages");

    matchers.forEach((matcher) => {
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

      if (result) {
        const targetValue = RED.util.evaluateNodeProperty(
          matcher.target,
          matcher.targetType,
          this.node,
          msg
        );
        messages[targetValue] = msg.payload;
        return false;
      }
    });

    this.save("messages", messages);

    if (Object.keys(messages).length >= this.config.minMsgCount) {
      this.debounce({
        received_msg: msg,
        send,
        result: messages,
      });
    } else {
      this.nodeStatus = "waiting";
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

export default function createMatchJoinNode(
  this: Node,
  config: MatchJoinNodeConfig
): void {
  RED.nodes.createNode(this, config);
  const node = this;
  MatchJoinNode.create(node, config);
}
