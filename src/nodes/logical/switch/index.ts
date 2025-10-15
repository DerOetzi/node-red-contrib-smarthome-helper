import { Node, NodeAPI } from "node-red";
import BaseNode from "../../flowctrl/base";
import Migration from "../../flowctrl/base/migration";
import { NodeMessageFlow } from "../../flowctrl/base/types";
import { NodeCategory } from "../../types";
import SwitchMigration from "./migration";
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
  protected static readonly _migration: Migration<any> = new SwitchMigration();

  constructor(
    RED: NodeAPI,
    node: Node,
    config: T,
    defaultConfig: U = SwitchNodeOptionsDefaults as U
  ) {
    super(RED, node, config, defaultConfig);
  }

  protected input(messageFlow: NodeMessageFlow) {
    this.switchHandling(messageFlow);
  }

  protected switchHandling(messageFlow: NodeMessageFlow): void {
    const debounceKey = this.debounceKey(messageFlow.topic);

    const shouldDebounce =
      this.config.debounceFlank === DebounceFlank.both ||
      this.isDebounceRunning(debounceKey) ||
      this.isRisingFlank(messageFlow) ||
      this.isFallingFlank(messageFlow);

    if (this.config.debounce && shouldDebounce) {
      this.debounce(messageFlow);
    } else {
      this.debouncePass(messageFlow);
    }
  }

  private isRisingFlank(messageFlow: NodeMessageFlow): boolean {
    return (
      this.config.debounceFlank === DebounceFlank.rising &&
      this.nodeStatus === false &&
      messageFlow.payload === true
    );
  }

  private isFallingFlank(messageFlow: NodeMessageFlow): boolean {
    return (
      this.config.debounceFlank === DebounceFlank.falling &&
      this.nodeStatus === true &&
      messageFlow.payload === false
    );
  }

  protected debounced(messageFlow: NodeMessageFlow): void {
    const result = messageFlow.payload;

    const configValue: any = result
      ? this.config.trueValue
      : this.config.falseValue;

    const configType: string = result
      ? this.config.trueType
      : this.config.falseType;

    if (configType === "__stop__") {
      this.nodeStatus = result;
      return;
    }

    const targetValue = this.RED.util.evaluateNodeProperty(
      configValue,
      configType,
      this.node,
      messageFlow.originalMsg
    );

    messageFlow.updateAdditionalAttribute("result", result);

    if (this.config.target === "payload") {
      messageFlow.payload = targetValue;
    } else {
      messageFlow.payload = messageFlow.originalMsg.payload;
      messageFlow.updateAdditionalAttribute(this.config.target, targetValue);
    }

    if (this.config.seperatedOutputs && result === false) {
      messageFlow.output = 1;
    }

    super.debounced(messageFlow);
  }

  protected updateStatusAfterDebounce(messageFlow: NodeMessageFlow): void {
    this.nodeStatus = messageFlow.getAdditionalAttribute("result");
  }
}
