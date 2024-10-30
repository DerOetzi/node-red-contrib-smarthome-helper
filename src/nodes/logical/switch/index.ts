import { Node } from "node-red";
import { RED } from "../../../globals";
import { BaseNode } from "../../flowctrl/base";
import { SwitchNodeConfig } from "./types";

class SwitchNode extends BaseNode<SwitchNodeConfig> {
  constructor(node: Node, config: SwitchNodeConfig) {
    super(node, config, { outputs: 2 });
  }

  public static create(node: Node, config: SwitchNodeConfig) {
    return new SwitchNode(node, config);
  }

  public onInput(msg: any, send: any, done: any) {
    const result = msg.payload;
    this.nodeStatus = result;

    const options = result ? { send } : { send, output: 1 };
    this.sendMsg(msg, options);

    if (done) {
      done();
    }
  }
}

export default function createSwitchNode(this: Node, config: SwitchNodeConfig) {
  RED.nodes.createNode(this, config);
  const node = this;
  SwitchNode.create(node, config);
}
