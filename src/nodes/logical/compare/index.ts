import { Node, NodeAPI } from "node-red";
import Migration from "../../flowctrl/base/migration";
import { NodeMessageFlow } from "../../flowctrl/base/types";
import SwitchNode from "../switch";
import CompareMigration from "./migration";
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
    if (propertyValue === undefined || propertyValue === null) {
      return false;
    }
    return propertyValue.startsWith(compareValue);
  }

  public static endsWith(propertyValue: string, compareValue: string): boolean {
    if (propertyValue === undefined || propertyValue === null) {
      return false;
    }
    return propertyValue.endsWith(compareValue);
  }

  public static contains(propertyValue: string, compareValue: string): boolean {
    if (propertyValue === undefined || propertyValue === null) {
      return false;
    }
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
  protected static readonly _migration: Migration<any> = new CompareMigration();

  constructor(RED: NodeAPI, node: Node, config: CompareNodeDef) {
    super(RED, node, config, CompareNodeOptionsDefaults);
  }

  protected input(messageFlow: NodeMessageFlow): void {
    const propertyValue = this.RED.util.evaluateNodeProperty(
      this.config.property,
      this.config.propertyType,
      this.node,
      messageFlow.originalMsg
    );
    const compareValue = this.RED.util.evaluateNodeProperty(
      this.config.compare,
      this.config.compareType,
      this.node,
      messageFlow.originalMsg
    );

    messageFlow.payload = CompareOperation.func(
      this.config.operation,
      propertyValue,
      compareValue
    );

    this.switchHandling(messageFlow);
  }
}
