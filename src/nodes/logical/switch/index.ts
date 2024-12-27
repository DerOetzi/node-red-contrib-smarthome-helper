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
    const msg = data.received_msg;
    const result = data.payload ?? msg.payload;

    if (result === true) {
      msg[this.config.target] = RED.util.evaluateNodeProperty(
        this.config.trueValue,
        this.config.trueType,
        this.node,
        msg
      );
    } else if (result === false) {
      msg[this.config.target] = RED.util.evaluateNodeProperty(
        this.config.falseValue,
        this.config.falseType,
        this.node,
        msg
      );
    }

    if (this.config.seperatedOutputs && result === false) {
      data.output = 1;
    }

    data.payload = msg.payload;

    this.sendMsg(msg, data);

    this.nodeStatus = result;
  }
}
