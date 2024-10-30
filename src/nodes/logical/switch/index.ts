import { Node } from "node-red";
import { BaseNode, BaseNodeConfig } from "../../flowctrl/base";

interface SwitchNodeConfig extends BaseNodeConfig {}

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
  SwitchNode.create(this, config);
}
