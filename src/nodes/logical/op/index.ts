import { Node, NodeAPI, NodeMessageInFlow, NodeStatusFill } from "node-red";
import { BaseNodeDebounceData } from "../../flowctrl/base/types";
import { NodeDoneFunction, NodeSendFunction } from "../../types";
import SwitchNode from "../switch";

import { cloneDeep } from "../../../helpers/object.helper";
import {
  LogicalFunction,
  LogicalOpNodeDef,
  LogicalOpNodeOptions,
  LogicalOpNodeOptionsDefaults,
} from "./types";

export class LogicalOperation {
  public static func(operation: LogicalFunction, values: boolean[]): boolean {
    return LogicalOperation[operation](values);
  }

  public static and(payloads: boolean[]): boolean {
    return payloads.every((value: boolean) => value === true);
  }

  public static or(payloads: boolean[]): boolean {
    return payloads.some((value: boolean) => value === true);
  }

  public static not(payloads: boolean[]): boolean {
    return !payloads[0];
  }

  public static nand(payloads: boolean[]): boolean {
    return LogicalOperation.not([LogicalOperation.and(payloads)]);
  }

  public static nor(payloads: boolean[]): boolean {
    return LogicalOperation.not([LogicalOperation.or(payloads)]);
  }

  public static xor(payloads: boolean[]): boolean {
    return payloads.filter((value) => value === true).length === 1;
  }

  public static nxor(payloads: boolean[]): boolean {
    return LogicalOperation.not([LogicalOperation.xor(payloads)]);
  }
}

export default class LogicalOpNode extends SwitchNode<
  LogicalOpNodeDef,
  LogicalOpNodeOptions
> {
  protected static readonly _nodeType = "op";

  private messages: Record<string, boolean> = {};

  constructor(RED: NodeAPI, node: Node, config: LogicalOpNodeDef) {
    super(RED, node, config, LogicalOpNodeOptionsDefaults);
  }

  protected onClose(): void {
    super.onClose();
    this.messages = {};
  }

  protected onInput(
    msg: NodeMessageInFlow,
    send: NodeSendFunction,
    done: NodeDoneFunction
  ): void {
    if (typeof msg.payload !== "boolean") {
      this.node.error("Payload must be a boolean value");
      return;
    }

    if (this.config.operation === LogicalFunction.not) {
      this.switchHandling({
        msg: msg,
        send,
        payload: LogicalOperation.not([msg.payload]),
        additionalAttributes: { input: msg.payload },
      });
    } else {
      if (typeof msg.topic !== "string") {
        this.node.error("Topic must be a string");
        return;
      }

      this.messages[msg.topic] = msg.payload;

      if (Object.keys(this.messages).length >= this.config.minMsgCount) {
        const payloads = Object.values(this.messages);

        this.switchHandling({
          msg: msg,
          send,
          payload: LogicalOperation.func(this.config.operation, payloads),
          additionalAttributes: { input: cloneDeep(this.messages) },
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
