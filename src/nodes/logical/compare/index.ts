import { Node, NodeMessageInFlow } from "node-red";
import { RED } from "../../../globals";
import { NodeRedDone, NodeRedSend } from "../../../types";
import { NodeType } from "../../types";
import SwitchNode from "../switch";
import { Comparator, comparators } from "./operations";
import {
  CompareNodeConfig,
  CompareNodeType,
  defaultCompareNodeConfig,
} from "./types";

export default class CompareNode extends SwitchNode<CompareNodeConfig> {
  private readonly comparator: Comparator;

  constructor(node: Node, config: CompareNodeConfig) {
    config = { ...defaultCompareNodeConfig, ...config };
    super(node, config);

    this.comparator = comparators[config.operator];
  }

  static get type(): NodeType {
    return CompareNodeType;
  }

  protected onInput(
    msg: NodeMessageInFlow,
    send: NodeRedSend,
    done: NodeRedDone
  ): void {
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

    this.debounce({ msg: msg, payload: result, send });

    if (done) {
      done();
    }
  }
}
