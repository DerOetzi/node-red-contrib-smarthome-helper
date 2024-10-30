import { Node } from "node-red";
import { RED } from "../../../globals";
import { BaseNode } from "../../flowctrl/base";
import { Comparator, comparators } from "./operations";
import { CompareNodeConfig, defaultCompareNodeConfig } from "./types";

export class CompareNode extends BaseNode<CompareNodeConfig> {
  private readonly comparator: Comparator;

  constructor(node: Node, config: CompareNodeConfig) {
    config = { ...defaultCompareNodeConfig, ...config };
    super(node, config);

    this.comparator = comparators[config.operator];
  }

  public static create(node: Node, config: CompareNodeConfig): CompareNode {
    return new CompareNode(node, config);
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

    this.sendMsg(msg, { send, payload: result });
    this.nodeStatus = result;

    if (done) {
      done();
    }
  }
}

export default function createCompareNode(
  this: Node,
  config: CompareNodeConfig
): void {
  RED.nodes.createNode(this, config);
  const node = this;
  CompareNode.create(node, config);
}
