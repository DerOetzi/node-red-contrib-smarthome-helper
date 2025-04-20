import { Node, NodeAPI } from "node-red";
import { convertToMilliseconds } from "../../../helpers/time.helper";
import { NodeCategory } from "../../types";
import {
  AutomationGateCategory,
  AutomationGateCommand,
  AutomationGateNodeMessage,
} from "../automation-gate/types";
import BaseNode from "../base";
import { NodeMessageFlow } from "../base/types";
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

  public input(messageFlow: NodeMessageFlow) {
    const gateControlMsg: AutomationGateNodeMessage = {
      ...this.gateControlMsg,
      originalMsg: messageFlow.originalMsg,
    };

    const gateControlMessageFlow = messageFlow.clone();
    gateControlMessageFlow.output = 1;

    this.sendMsgToOutput(gateControlMsg, gateControlMessageFlow);

    setTimeout(() => {
      this.debounce(messageFlow);
    }, this.config.delay);
  }
}
