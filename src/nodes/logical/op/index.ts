import { Node, NodeStatusFill } from "node-red";
import { RED } from "../../../globals";
import { BaseNode } from "../../flowctrl/base";
import { LogicalOperation, logicalOperations, notOp } from "./operations";
import { defaultLogicalOpNodeConfig, LogicalOpNodeConfig } from "./types";

const messagesStoreKey = "messagesStore";

export class LogicalOpNode extends BaseNode<LogicalOpNodeConfig> {
  private readonly operator: LogicalOperation;

  constructor(node: Node, config: LogicalOpNodeConfig) {
    config = { ...defaultLogicalOpNodeConfig, ...config };
    super(node, config);

    this.operator = logicalOperations[config.logical];
  }

  public static create(node: Node, config: LogicalOpNodeConfig): LogicalOpNode {
    return new LogicalOpNode(node, config);
  }

  protected onInput(msg: any, send: any, done: any): void {
    if (typeof msg.payload !== "boolean") {
      this.node.error("Payload must be a boolean value");
      return;
    }

    if (this.config.logical === "not") {
      this.sendResult(msg, send, notOp(msg.payload));
    } else {
      if (typeof msg.topic !== "string") {
        this.node.error("Topic must be a string");
        return;
      }

      const messages = this.loadRecord(messagesStoreKey);
      messages[msg.topic] = msg.payload;
      this.save(messagesStoreKey, messages);

      if (Object.keys(messages).length >= this.config.minMsgCount) {
        const payloads = Object.values(messages);
        this.sendResult(msg, send, this.operator.func(payloads));
      } else {
        this.nodeStatus = "waiting";
      }
    }

    if (done) {
      done();
    }
  }

  private sendResult(msg: any, send: any, result: boolean): void {
    this.sendMsg(msg, { send, payload: result });
    this.nodeStatus = result;
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

export default function createLogicalOpNode(
  this: Node,
  config: LogicalOpNodeConfig
): void {
  RED.nodes.createNode(this, config);
  const node = this;
  LogicalOpNode.create(node, config);
}
