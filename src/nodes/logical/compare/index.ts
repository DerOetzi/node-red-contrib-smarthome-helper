import { Node } from "node-red";
import { RED } from "../../../globals";
import BaseNode from "../../flowctrl/base";
import { BaseNodeDebounceData } from "../../flowctrl/base/types";
import { NodeCategory, NodeType } from "../../types";
import { logicalCategory } from "../types";
import { Comparator, comparators } from "./operations";
import {
  CompareNodeConfig,
  CompareNodeType,
  defaultCompareNodeConfig,
} from "./types";

export default class CompareNode extends BaseNode<CompareNodeConfig> {
  private readonly comparator: Comparator;

  constructor(node: Node, config: CompareNodeConfig) {
    config = { ...defaultCompareNodeConfig, ...config };
    super(node, config);

    this.comparator = comparators[config.operator];
  }

  static get type(): NodeType {
    return CompareNodeType;
  }

  protected onInput(msg: any, send: any, done: any): void {
    const propertyValue = RED.util.evaluateNodeProperty(
      this.config.property,
      this.config.propertyType,
      this.node,
      msg
    );
    const compareValue = RED.util.evaluateNodeProperty(
      this.config.value,
      this.config.valueType,
      this.node,
      msg
    );

    let result: boolean;
    if (this.comparator.propertyOnly) {
      result = this.comparator.func(propertyValue);
    } else {
      result = this.comparator.func(propertyValue, compareValue);
    }

    this.debounce({ received_msg: msg, result, send });

    if (done) {
      done();
    }
  }

  protected debounceListener(data: BaseNodeDebounceData): void {
    this.sendMsg(data.received_msg, {
      send: data.send,
      payload: data.result,
      additionalAttributes: { message: data.received_msg },
    });
    this.nodeStatus = data.result;
  }
}
