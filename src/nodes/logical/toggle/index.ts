import { Node } from "node-red";
import { NodeType } from "../../types";
import SwitchNode from "../switch";
import {
  defaultToggleNodeConfig,
  ToggleNodeConfig,
  ToggleNodeType,
} from "./types";

export default class ToggleNode extends SwitchNode<ToggleNodeConfig> {
  static get type(): NodeType {
    return ToggleNodeType;
  }

  constructor(
    node: Node,
    config: ToggleNodeConfig,
    private lastValue: boolean
  ) {
    config = { ...defaultToggleNodeConfig, ...config };
    super(node, config);
  }

  protected onInput(msg: any, send: any, done: any): void {
    const command = msg.payload;

    if (command === "toggle") {
      this.lastValue = !this.lastValue;
    } else if (typeof command === "boolean") {
      this.lastValue = command;
    }

    this.debounce({
      received_msg: msg,
      send,
      result: this.lastValue,
    });

    if (done) {
      done();
    }
  }
}
