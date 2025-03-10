import { Node, NodeAPI, NodeMessageInFlow } from "node-red";
import { NodeDoneFunction, NodeSendFunction } from "../../types";
import SwitchNode from "../switch";
import {
  ApplicableCompareFunction,
  CompareNodeDef,
  CompareNodeOptions,
  CompareNodeOptionsDefaults,
  NotApplicableCompareFunction,
} from "./types";

export class CompareOperation {
  public static func(
    operation: ApplicableCompareFunction | NotApplicableCompareFunction,
    propertyValue: any,
    compareValue?: any
  ): boolean {
    if (Object.keys(ApplicableCompareFunction).includes(operation)) {
      return CompareOperation[operation](propertyValue, compareValue);
    }

    return (CompareOperation[operation] as any)(propertyValue);
  }

  public static eq(propertyValue: any, compareValue: any): boolean {
    return propertyValue === compareValue;
  }

  public static neq(propertyValue: any, compareValue: any): boolean {
    return !CompareOperation.eq(propertyValue, compareValue);
  }

  public static lt(
    propertyValue: number | Date,
    compareValue: number | Date
  ): boolean {
    return propertyValue < compareValue;
  }

  public static lte(
    propertyValue: number | Date,
    compareValue: number | Date
  ): boolean {
    return propertyValue <= compareValue;
  }

  public static gt(
    propertyValue: number | Date,
    compareValue: number | Date
  ): boolean {
    return propertyValue > compareValue;
  }

  public static gte(
    propertyValue: number | Date,
    compareValue: number | Date
  ): boolean {
    return propertyValue >= compareValue;
  }

  public static isTrue(propertyValue: boolean): boolean {
    return propertyValue === true;
  }

  public static isFalse(propertyValue: boolean): boolean {
    return propertyValue === false;
  }

  public static empty(propertyValue: any): boolean {
    return (
      propertyValue === "" ||
      propertyValue === undefined ||
      propertyValue === null
    );
  }

  public static notEmpty(propertyValue: any): boolean {
    return !CompareOperation.empty(propertyValue);
  }

  public static startsWith(
    propertyValue: string,
    compareValue: string
  ): boolean {
    return propertyValue.startsWith(compareValue);
  }

  public static endsWith(propertyValue: string, compareValue: string): boolean {
    return propertyValue.endsWith(compareValue);
  }

  public static contains(propertyValue: string, compareValue: string): boolean {
    return propertyValue.includes(compareValue);
  }

  public static regex(propertyValue: string, compareValue: string): boolean {
    return new RegExp(compareValue).test(propertyValue);
  }
}

export default class CompareNode extends SwitchNode<
  CompareNodeDef,
  CompareNodeOptions
> {
  protected static readonly _nodeType = "compare";

  constructor(RED: NodeAPI, node: Node, config: CompareNodeDef) {
    super(RED, node, config, CompareNodeOptionsDefaults);
  }

  protected onInput(
    msg: NodeMessageInFlow,
    send: NodeSendFunction,
    done: NodeDoneFunction
  ): void {
    const propertyValue = this.RED.util.evaluateNodeProperty(
      this.config.property,
      this.config.propertyType,
      this.node,
      msg
    );
    const compareValue = this.RED.util.evaluateNodeProperty(
      this.config.compare,
      this.config.compareType,
      this.node,
      msg
    );

    let result: boolean = CompareOperation.func(
      this.config.operation,
      propertyValue,
      compareValue
    );

    this.switchHandling({ msg, payload: result, send });

    if (done) {
      done();
    }
  }
}
