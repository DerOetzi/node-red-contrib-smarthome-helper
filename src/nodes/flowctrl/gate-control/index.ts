import { Node, NodeAPI, NodeMessageInFlow } from "node-red";
import { convertToMilliseconds } from "../../../helpers/time.helper";
import { NodeCategory, NodeDoneFunction, NodeSendFunction } from "../../types";
import {
  AutomationGateCategory,
  AutomationGateCommand,
  AutomationGateNodeMessage,
} from "../automation-gate/types";
import BaseNode from "../base";
import {
  GateControlNodeDef,
  GateControlNodeOptions,
  GateControlNodeOptionsDefaults,
} from "./types";

export default class GateControlNode extends BaseNode<
  GateControlNodeDef,
  GateControlNodeOptions
> {
  protected static readonly _nodeCategory: NodeCategory =
    AutomationGateCategory;
  protected static readonly _nodeType: string = "gate-control";

  private readonly gateControlMsg: AutomationGateNodeMessage;

  constructor(RED: NodeAPI, node: Node, config: GateControlNodeDef) {
    super(RED, node, config, GateControlNodeOptionsDefaults);

    this.gateControlMsg = {
      gate: this.config.gateCommand,
    };

    if (config.gateCommand === AutomationGateCommand.Pause) {
      this.gateControlMsg.pause = convertToMilliseconds(
        this.config.pauseTime!,
        this.config.pauseUnit
      );
    }
  }

  public onInput(
    msg: NodeMessageInFlow,
    send: NodeSendFunction,
    done: NodeDoneFunction
  ) {
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
