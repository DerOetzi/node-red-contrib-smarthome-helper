import { Node, NodeStatusFill } from "node-red";
import BaseNode from "../../flowctrl/base";
import {
  BaseNodeDebounceData,
  NodeSendOptions,
} from "../../flowctrl/base/types";
import { NodeType } from "../../types";
import { LogicalOperation, logicalOperations, notOp } from "./operations";
import {
  defaultLogicalOpNodeConfig,
  LogicalOpNodeConfig,
  LogicalOpNodeType,
} from "./types";

const messagesStoreKey = "messagesStore";

export default class LogicalOpNode extends BaseNode<LogicalOpNodeConfig> {
  private readonly operator: LogicalOperation;

  constructor(node: Node, config: LogicalOpNodeConfig) {
    config = { ...defaultLogicalOpNodeConfig, ...config };
    super(node, config);

    this.operator = logicalOperations[config.logical];
  }

  static get type(): NodeType {
    return LogicalOpNodeType;
  }

  protected onInput(msg: any, send: any, done: any): void {
    if (typeof msg.payload !== "boolean") {
      this.node.error("Payload must be a boolean value");
      return;
    }

    if (this.config.logical === "not") {
      this.debounce({
        received_msg: msg,
        send,
        result: notOp(msg.payload),
        additionalAttributes: { message: msg },
      });
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
        this.debounce({
          received_msg: msg,
          send,
          result: this.operator.func(payloads),
          additionalAttributes: { messages },
        });
      } else {
        this.nodeStatus = "waiting";
      }
    }

    if (done) {
      done();
    }
  }

  protected debounceListener(data: BaseNodeDebounceData): void {
    let sendOptions: NodeSendOptions = {
      send: data.send,
      payload: data.result,
      additionalAttributes: data.additionalAttributes,
    };

    this.sendMsg(data.received_msg, sendOptions);
    this.nodeStatus = data.result;
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
