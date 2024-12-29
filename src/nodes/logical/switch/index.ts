import { Node } from "node-red";
import { RED } from "../../../globals";
import BaseNode from "../../flowctrl/base";
import {
  BaseNodeDebounceData,
  BaseNodeOptions,
} from "../../flowctrl/base/types";
import { NodeType } from "../../types";
import {
  defaultSwitchNodeConfig,
  SwitchNodeConfig,
  SwitchNodeType,
} from "./types";

export default class SwitchNode<
  T extends SwitchNodeConfig = SwitchNodeConfig,
> extends BaseNode<T> {
  constructor(
    node: Node,
    config: SwitchNodeConfig,
    options: BaseNodeOptions = {}
  ) {
    config = { ...defaultSwitchNodeConfig, ...config };
    super(node, config as T, options);
  }

  static get type(): NodeType {
    return SwitchNodeType;
  }

  protected debounceListener(data: BaseNodeDebounceData): void {
    const msg = data.msg;
    const result = data.payload ?? msg.payload;

    this.nodeStatus = result;

    const configValue: any = result
      ? this.config.trueValue
      : this.config.falseValue;

    const configType: string = result
      ? this.config.trueType
      : this.config.falseType;

    if (configType === "__stop__") {
      return;
    }

    const targetValue = RED.util.evaluateNodeProperty(
      configValue,
      configType,
      this.node,
      msg
    );

    if (this.config.target === "payload") {
      data.payload = targetValue;
    } else {
      data.additionalAttributes = {
        ...data.additionalAttributes,
        [this.config.target]: targetValue,
      };
    }

    if (this.config.seperatedOutputs && result === false) {
      data.output = 1;
    }

    this.sendMsg(msg, data);
  }
}
