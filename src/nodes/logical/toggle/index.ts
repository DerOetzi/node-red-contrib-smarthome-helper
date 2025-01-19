import { Node, NodeAPI, NodeMessageInFlow } from "node-red";
import { NodeDoneFunction, NodeSendFunction } from "../../types";
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

  protected onInput(
    msg: NodeMessageInFlow,
    send: NodeSendFunction,
    done: NodeDoneFunction
  ): void {
    const command = msg.payload;

    if (command === "toggle") {
      this.lastValue = !this.lastValue;
    } else if (typeof command === "boolean") {
      this.lastValue = command;
    }

    this.debounce({
      msg: msg,
      send,
      payload: this.lastValue,
    });

    if (done) {
      done();
    }
  }
}
