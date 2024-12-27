import { Node, NodeStatusFill } from "node-red";
import { NodeType } from "../../types";
import SwitchNode from "../switch";
import { LogicalOperation, logicalOperations, notOp } from "./operations";
import {
  defaultLogicalOpNodeConfig,
  LogicalOpNodeConfig,
  LogicalOpNodeType,
} from "./types";
import { BaseNodeDebounceData } from "../../flowctrl/base/types";

export default class LogicalOpNode extends SwitchNode<LogicalOpNodeConfig> {
  private readonly operator: LogicalOperation;
  private messages: Record<string, any> = {};

  static get type(): NodeType {
    return LogicalOpNodeType;
  }

  constructor(node: Node, config: LogicalOpNodeConfig) {
    config = { ...defaultLogicalOpNodeConfig, ...config };
    super(node, config, { filterkey: "filterResult" });

    this.operator = logicalOperations[config.logical];
  }

  protected onClose(): void {
    super.onClose();
    this.messages = {};
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
        payload: notOp(msg.payload),
        additionalAttributes: { input: msg },
      });
    } else {
      if (typeof msg.topic !== "string") {
        this.node.error("Topic must be a string");
        return;
      }

      this.messages[msg.topic] = msg.payload;

      if (Object.keys(this.messages).length >= this.config.minMsgCount) {
        const payloads = Object.values(this.messages);
        this.debounce({
          received_msg: msg,
          send,
          payload: this.operator.func(payloads),
          additionalAttributes: { input: this.messages },
        });
      } else {
        this.nodeStatus = "waiting";
      }
    }

    if (done) {
      done();
    }
  }

  protected updateStatusAfterDebounce(data: BaseNodeDebounceData): void {
    this.nodeStatus = data.payload;
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
