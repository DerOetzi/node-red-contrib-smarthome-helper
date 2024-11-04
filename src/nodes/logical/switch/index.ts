import { Node } from "node-red";
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
