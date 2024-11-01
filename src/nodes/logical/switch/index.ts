import { Node } from "node-red";
import { RED } from "../../../globals";
import { BaseNode } from "../../flowctrl/base";
import { BaseNodeDebounceData } from "../../flowctrl/base/types";
import { SwitchNodeConfig } from "./types";

class SwitchNode extends BaseNode<SwitchNodeConfig> {
  constructor(node: Node, config: SwitchNodeConfig) {
    super(node, config, { outputs: 2 });
  }

  public static create(node: Node, config: SwitchNodeConfig) {
    return new SwitchNode(node, config);
  }

  public onInput(msg: any, send: any, done: any) {
    this.debounce({ received_msg: msg, send: send });

    if (done) {
      done();
    }
  }

  protected debounceListener(data: BaseNodeDebounceData): void {
    const result = data.received_msg.payload;
    this.nodeStatus = result;

    const options = result
      ? { send: data.send }
      : { send: data.send, output: 1 };
    this.sendMsg(data.received_msg, options);
  }
}

export default function createSwitchNode(this: Node, config: SwitchNodeConfig) {
  RED.nodes.createNode(this, config);
  const node = this;
  SwitchNode.create(node, config);
}
