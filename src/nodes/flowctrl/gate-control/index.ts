import { Node, NodeMessageInFlow } from "node-red";
import { convertToMilliseconds } from "../../../helpers/time.helper";
import { NodeRedDone, NodeRedSend } from "../../../types";
import { NodeType } from "../../types";
import {
  AutomationGateCommand,
  AutomationGateNodeMessage,
} from "../automation-gate/types";
import BaseNode from "../base";
import {
  defaultGateControlNodeConfig,
  GateControlNodeConfig,
  GateControlNodeType,
} from "./types";

export default class GateControlNode extends BaseNode<GateControlNodeConfig> {
  private readonly gateControlMsg: AutomationGateNodeMessage;

  constructor(node: Node, config: GateControlNodeConfig) {
    config = { ...defaultGateControlNodeConfig, ...config };

    super(node, config);

    this.gateControlMsg = {
      gate: config.gateCommand,
    };

    if (config.gateCommand === AutomationGateCommand.Pause) {
      this.gateControlMsg.pause = convertToMilliseconds(
        config.pauseTime!,
        config.pauseUnit
      );
    }
  }

  static get type(): NodeType {
    return GateControlNodeType;
  }

  public onInput(msg: NodeMessageInFlow, send: NodeRedSend, done: NodeRedDone) {
    const gateControlMsg: AutomationGateNodeMessage = {
      ...this.gateControlMsg,
      originalMsg: msg,
    };
    this.sendMsgToOutput(gateControlMsg, { send, output: 1 });

    setTimeout(() => {
      this.debounce({ msg });
    }, this.config.delay);

    if (done) {
      done();
    }
  }
}
