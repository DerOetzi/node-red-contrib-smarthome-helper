import { Node } from "node-red";
import { convertToMilliseconds } from "../../../helpers/time.helper";
import { NodeType } from "../../types";
import BaseNode from "../base";
import { BaseNodeDebounceData } from "../base/types";
import {
  defaultGateControlNodeConfig,
  GateControlNodeConfig,
  GateControlNodeType,
} from "./types";

export default class GateControlNode extends BaseNode<GateControlNodeConfig> {
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

  static get type(): NodeType {
    return GateControlNodeType;
  }

  public onInput(msg: any, send: any, done: any) {
    const gateControlMsg = { ...this.gateControlMsg, originalMsg: msg };
    this.sendMsgToOutput(gateControlMsg, { send, output: 1 });

    setTimeout(() => {
      this.debounce({ received_msg: msg });
      this.nodeStatus = new Date();
    }, this.config.delay);

    if (done) {
      done();
    }
  }

  protected debounceListener(data: BaseNodeDebounceData): void {
    this.sendMsg(data.received_msg);
  }
}
