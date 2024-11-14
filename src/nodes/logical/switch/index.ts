import { Node } from "node-red";
import { RED } from "../../../globals";
import BaseNode from "../../flowctrl/base";
import { BaseNodeDebounceData } from "../../flowctrl/base/types";
import { NodeType } from "../../types";
import { SwitchNodeConfig, SwitchNodeType } from "./types";

export default class SwitchNode extends BaseNode<SwitchNodeConfig> {
  constructor(node: Node, config: SwitchNodeConfig) {
    super(node, config, { outputs: 2 });
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

    const options = result
      ? { send: data.send }
      : { send: data.send, output: 1 };
    this.sendMsg(msg, options);

    this.nodeStatus = result;
  }
}
