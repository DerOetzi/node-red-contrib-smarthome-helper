import { Node } from "node-red";
import { RED } from "../../../globals";
import BaseNode from "../../flowctrl/base";
import {
  BaseNodeDebounceData,
  NodeSendOptions,
} from "../../flowctrl/base/types";
import { NodeType } from "../../types";
import { SwitchNodeConfig, SwitchNodeType } from "./types";

export default class SwitchNode extends BaseNode<SwitchNodeConfig> {
  constructor(node: Node, config: SwitchNodeConfig) {
    super(node, config);
  }

  static get type(): NodeType {
    return SwitchNodeType;
  }

  protected debounceListener(data: BaseNodeDebounceData): void {
    const msg = data.received_msg;
    const result = msg.payload;

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

    const options: NodeSendOptions = { send: data.send };

    if (this.config.seperatedOutputs && result === false) {
      options.output = 1;
    }

    this.sendMsg(msg, options);

    this.nodeStatus = result;
  }
}
