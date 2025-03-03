import { BaseNodeDebounceData } from "@base/types";
import MatchJoinNode from "@match-join";
import { MatchJoinNodeData } from "@match-join/types";
import { NodeCategory } from "@nodes/types";
import { OperatorCategory } from "@operator/types";
import { Node, NodeAPI } from "node-red";
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

  protected matched(data: MatchJoinNodeData): void {
    const msg = data.msg;
    const valueType = msg.topic;

    if (typeof msg.payload !== "number") {
      this.node.error("Payload must be a number");
      return;
    }

    switch (valueType) {
      case ArithmeticTarget.minuend:
        this.minuend = msg.payload;
        break;
      case ArithmeticTarget.value:
        this.values[msg.originalTopic] = msg.payload;
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
          msg
        )
      );
    });

    switch (this.config.operation) {
      case ArithmeticFunction.add:
        data.payload = ArithmeticOperation.add(values);
        break;
      case ArithmeticFunction.sub:
        data.payload = ArithmeticOperation.sub(this.minuend, values);
        break;
      case ArithmeticFunction.mul:
        data.payload = ArithmeticOperation.mul(values);
        break;
      case ArithmeticFunction.round:
        data.payload = msg.payload;
        break;
      case ArithmeticFunction.mean:
        data.payload = ArithmeticOperation.mean(values);
        break;
      case ArithmeticFunction.min:
        data.payload = ArithmeticOperation.min(values);
        break;
      case ArithmeticFunction.max:
        data.payload = ArithmeticOperation.max(values);
        break;
    }

    data.payload = ArithmeticOperation.round(
      data.payload,
      this.config.precision
    );

    this.debounce(data);
  }

  protected updateStatusAfterDebounce(data: BaseNodeDebounceData): void {
    this.nodeStatus = data.payload;
  }
}
