import { NodeAPI, Node } from "node-red";
import SwitchNode from "../switch";
import {
  HysteresisSwitchNodeDef,
  HysteresisSwitchNodeOptions,
  HysteresisSwitchNodeOptionsDefaults,
} from "./types";
import { NodeMessageFlow } from "../../flowctrl/base/types";
import { CompareOperation } from "../compare";

export default class HysteresisSwitchNode extends SwitchNode<
  HysteresisSwitchNodeDef,
  HysteresisSwitchNodeOptions
> {
  protected static readonly _nodeType = "hysteresis-switch";

  private actualState: boolean;

  constructor(RED: NodeAPI, node: Node, config: HysteresisSwitchNodeDef) {
    super(RED, node, config, HysteresisSwitchNodeOptionsDefaults);
    this.actualState = this.config.initialState;
  }

  protected input(messageFlow: NodeMessageFlow): void {
    const payload = messageFlow.payloadAsNumber();

    if (typeof payload === "undefined") {
      this.node.error("Payload is not a number", messageFlow.payload);
      return;
    }

    if (CompareOperation.lt(payload, this.config.lowerThreshold)) {
      this.actualState = false;
    } else if (CompareOperation.gt(payload, this.config.upperThreshold)) {
      this.actualState = true;
    }

    messageFlow.payload = this.actualState;

    this.switchHandling(messageFlow);
  }
}
