import { Node, NodeAPI } from "node-red";
import { NodeMessageFlow } from "../../flowctrl/base/types";
import SwitchNode from "../switch";
import {
  ToggleNodeDef,
  ToggleNodeOptions,
  ToggleNodeOptionsDefaults,
} from "./types";

export default class ToggleNode extends SwitchNode<
  ToggleNodeDef,
  ToggleNodeOptions
> {
  protected static readonly _nodeType = "toggle";

  private lastValue?: boolean;

  constructor(RED: NodeAPI, node: Node, config: ToggleNodeDef) {
    super(RED, node, config, ToggleNodeOptionsDefaults);
  }

  protected input(messageFlow: NodeMessageFlow): void {
    const command = messageFlow.payload;

    if (command === "toggle") {
      this.lastValue = !this.lastValue;
    } else if (typeof command === "boolean") {
      this.lastValue = command;
    }

    messageFlow.payload = this.lastValue;
    this.switchHandling(messageFlow);
  }
}
