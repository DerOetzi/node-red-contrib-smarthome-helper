import { Node } from "node-red";
import { RED } from "../../../globals";
import { convertToMilliseconds } from "../../../helpers/time.helper";
import { BaseNode } from "../base";
import { defaultGateControlNodeConfig, GateControlNodeConfig } from "./types";

export class GateControlNode extends BaseNode<GateControlNodeConfig> {
  private readonly gateControlMsg: any;

  constructor(node: Node, config: GateControlNodeConfig) {
    config = { ...defaultGateControlNodeConfig, ...config };

    super(node, config);

    this.gateControlMsg = {
      gate: config.gateCommand,
      originalMsg: null,
    };

    if (config.gateCommand === "pause") {
      this.gateControlMsg.pause = convertToMilliseconds(
        config.pauseTime!,
        config.pauseUnit
      );
    }
  }

  public static create(node: Node, config: GateControlNodeConfig) {
    return new GateControlNode(node, config);
  }

  public onInput(msg: any, send: any, done: any) {
    const gateControlMsg = { ...this.gateControlMsg, originalMsg: msg };
    this.sendMsgToOutput(gateControlMsg, { send, output: 1 });

    setTimeout(() => {
      this.sendMsg(msg);
      this.nodeStatus = new Date();
    }, this.config.delay);

    if (done) {
      done();
    }
  }
}

export default function createGateControlNode(
  this: Node,
  config: GateControlNodeConfig
): void {
  RED.nodes.createNode(this, config);
  const node = this;
  GateControlNode.create(node, config);
}
