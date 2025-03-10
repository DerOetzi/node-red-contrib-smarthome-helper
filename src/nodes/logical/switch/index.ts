import { Node, NodeAPI, NodeMessageInFlow } from "node-red";
import BaseNode from "../../flowctrl/base";
import { BaseNodeDebounceData } from "../../flowctrl/base/types";
import { NodeCategory, NodeDoneFunction, NodeSendFunction } from "../../types";
import {
  DebounceFlank,
  LogicalOpCategory,
  SwitchNodeDef,
  SwitchNodeOptions,
  SwitchNodeOptionsDefaults,
} from "./types";

export default class SwitchNode<
  T extends SwitchNodeDef = SwitchNodeDef,
  U extends SwitchNodeOptions = SwitchNodeOptions,
> extends BaseNode<T, U> {
  protected static readonly _nodeCategory: NodeCategory = LogicalOpCategory;
  protected static readonly _nodeType: string = "switch";

  constructor(
    RED: NodeAPI,
    node: Node,
    config: T,
    defaultConfig: U = SwitchNodeOptionsDefaults as U
  ) {
    super(RED, node, config, defaultConfig);
  }

  protected onInput(
    msg: NodeMessageInFlow,
    send: NodeSendFunction,
    done: NodeDoneFunction
  ) {
    this.switchHandling({ msg: msg, send, payload: msg.payload });

    if (done) {
      done();
    }
  }

  protected switchHandling(data: BaseNodeDebounceData): void {
    const debounceKey = this.debounceKey(data.msg);

    const shouldDebounce =
      this.config.debounceFlank === DebounceFlank.both ||
      this.isDebounceRunning(debounceKey) ||
      this.isRisingFlank(data) ||
      this.isFallingFlank(data);

    if (this.config.debounce && shouldDebounce) {
      this.debounce(data);
    } else {
      this.debouncePass(data);
    }
  }

  private isRisingFlank(data: BaseNodeDebounceData): boolean {
    return (
      this.config.debounceFlank === DebounceFlank.rising &&
      this.nodeStatus === false &&
      data.payload === true
    );
  }

  private isFallingFlank(data: BaseNodeDebounceData): boolean {
    return (
      this.config.debounceFlank === DebounceFlank.falling &&
      this.nodeStatus === true &&
      data.payload === false
    );
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
