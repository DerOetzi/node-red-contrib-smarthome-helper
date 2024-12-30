import { Node, NodeAPI } from "node-red";
import BaseNode from "../../flowctrl/base";
import { BaseNodeDebounceData } from "../../flowctrl/base/types";
import { NodeCategory, NodeColor } from "../../types";
import { logicalCategory } from "../types";
import {
  SwitchNodeDef,
  SwitchNodeOptions,
  SwitchNodeOptionsDefaults,
} from "./types";

export default class SwitchNode<
  T extends SwitchNodeDef = SwitchNodeDef,
  U extends SwitchNodeOptions = SwitchNodeOptions,
> extends BaseNode<T, U> {
  public static readonly NodeCategory: NodeCategory = logicalCategory;
  public static readonly NodeType: string = "switch";
  public static readonly NodeColor: NodeColor = NodeColor.Logical;

  constructor(
    RED: NodeAPI,
    node: Node,
    config: T,
    defaultConfig: U = SwitchNodeOptionsDefaults as U
  ) {
    super(RED, node, config, defaultConfig);
  }

  protected debounceListener(data: BaseNodeDebounceData): void {
    const msg = data.msg;
    const result = data.payload ?? msg.payload;

    this.nodeStatus = result;

    const configValue: any = result
      ? this.config.trueValue
      : this.config.falseValue;

    const configType: string = result
      ? this.config.trueType
      : this.config.falseType;

    if (configType === "__stop__") {
      return;
    }

    const targetValue = this.RED.util.evaluateNodeProperty(
      configValue,
      configType,
      this.node,
      msg
    );

    if (this.config.target === "payload") {
      data.payload = targetValue;
    } else {
      data.additionalAttributes = {
        ...data.additionalAttributes,
        [this.config.target]: targetValue,
      };
    }

    if (this.config.seperatedOutputs && result === false) {
      data.output = 1;
    }

    this.sendMsg(msg, data);
  }
}
