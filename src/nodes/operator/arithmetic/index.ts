import { Node, NodeAPI } from "node-red";
import { NodeMessageFlow } from "../../flowctrl/base/types";
import MatchJoinNode from "../../flowctrl/match-join";
import { NodeCategory } from "../../types";
import { OperatorCategory } from "../types";
import {
  ArithmeticFunction,
  ArithmeticNodeDef,
  ArithmeticNodeOptions,
  ArithmeticNodeOptionsDefaults,
  ArithmeticTarget,
} from "./types";

export class ArithmeticOperation {
  public static add(addends: number[]): number {
    return addends.reduce((acc, value) => acc + value, 0);
  }

  public static sub(minuend: number, subtrahends: number[]): number {
    return subtrahends.reduce((acc, value) => acc - value, minuend);
  }

  public static mul(factors: number[]): number {
    return factors.reduce((acc, value) => acc * value, 1);
  }

  public static round(value: number, precision: number = 0): number {
    const factor = Math.pow(10, precision);
    return Math.round(value * factor) / factor;
  }

  public static mean(values: number[]): number {
    return values.length > 0
      ? values.reduce((acc, value) => acc + value, 0) / values.length
      : 0;
  }

  public static min(values: number[]): number {
    return Math.min(...values);
  }

  public static max(values: number[]): number {
    return Math.max(...values);
  }
}

export default class ArithmeticNode extends MatchJoinNode<
  ArithmeticNodeDef,
  ArithmeticNodeOptions
> {
  protected static readonly _nodeCategory: NodeCategory = OperatorCategory;
  protected static readonly _nodeType: string = "arithmetic";

  constructor(
    RED: NodeAPI,
    node: Node,
    config: ArithmeticNodeDef,
    private minuend: number,
    private values: Record<string, number> = {}
  ) {
    super(RED, node, config, ArithmeticNodeOptionsDefaults);
  }

  protected matched(messageFlow: NodeMessageFlow): void {
    const valueType = messageFlow.topic;

    if (typeof messageFlow.payload !== "number") {
      this.node.error("Payload must be a number");
      return;
    }

    switch (valueType) {
      case ArithmeticTarget.minuend:
        this.minuend = messageFlow.payload;
        break;
      case ArithmeticTarget.value:
        this.values[messageFlow.originalTopic ?? "default"] =
          messageFlow.payload;
        break;
    }

    const values = Object.values(this.values);

    if (
      values.length < this.config.minValueCount ||
      (this.config.operation === "sub" && !this.minuend)
    ) {
      this.nodeStatus = "waiting";
      return;
    }

    this.config.additionalValues?.forEach((row) => {
      values.push(
        this.RED.util.evaluateNodeProperty(
          row.value,
          row.valueType,
          this.node,
          messageFlow.originalMsg
        )
      );
    });

    switch (this.config.operation) {
      case ArithmeticFunction.add:
        messageFlow.payload = ArithmeticOperation.add(values);
        break;
      case ArithmeticFunction.sub:
        messageFlow.payload = ArithmeticOperation.sub(this.minuend, values);
        break;
      case ArithmeticFunction.mul:
        messageFlow.payload = ArithmeticOperation.mul(values);
        break;
      case ArithmeticFunction.round:
        break;
      case ArithmeticFunction.mean:
        messageFlow.payload = ArithmeticOperation.mean(values);
        break;
      case ArithmeticFunction.min:
        messageFlow.payload = ArithmeticOperation.min(values);
        break;
      case ArithmeticFunction.max:
        messageFlow.payload = ArithmeticOperation.max(values);
        break;
    }

    messageFlow.payload = ArithmeticOperation.round(
      messageFlow.payload,
      this.config.precision
    );

    this.debounce(messageFlow);
  }

  protected updateStatusAfterDebounce(messageFlow: NodeMessageFlow): void {
    this.nodeStatus = messageFlow.payload;
  }
}
