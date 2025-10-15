import { Node, NodeAPI, NodeStatusFill } from "node-red";
import { cloneDeep } from "../../../helpers/object.helper";
import { NodeMessageFlow } from "../../flowctrl/base/types";
import SwitchNode from "../switch";
import {
  LogicalFunction,
  LogicalOpNodeDef,
  LogicalOpNodeOptions,
  LogicalOpNodeOptionsDefaults,
} from "./types";
import Migration from "../../flowctrl/base/migration";
import LogicalOpMigration from "./migration";

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
  protected static readonly _migration: Migration<any> =
    new LogicalOpMigration();

  private messages: Record<string, boolean> = {};

  constructor(RED: NodeAPI, node: Node, config: LogicalOpNodeDef) {
    super(RED, node, config, LogicalOpNodeOptionsDefaults);
  }

  protected onClose(): void {
    super.onClose();
    this.messages = {};
  }

  protected input(messageFlow: NodeMessageFlow): void {
    if (typeof messageFlow.payload !== "boolean") {
      this.node.error("Payload must be a boolean value");
      return;
    }

    if (this.config.operation === LogicalFunction.not) {
      messageFlow.updateAdditionalAttribute("input", messageFlow.payload);
      messageFlow.payload = LogicalOperation.not([messageFlow.payload]);
    } else {
      if (typeof messageFlow.topic !== "string") {
        this.node.error("Topic must be a string");
        return;
      }

      this.messages[messageFlow.topic] = messageFlow.payload;

      if (Object.keys(this.messages).length >= this.config.minMsgCount) {
        const payloads = Object.values(this.messages);
        messageFlow.updateAdditionalAttribute(
          "input",
          cloneDeep(this.messages)
        );
        messageFlow.payload = LogicalOperation.func(
          this.config.operation,
          payloads
        );
      } else {
        this.nodeStatus = "waiting";
        return;
      }
    }

    this.switchHandling(messageFlow);
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
