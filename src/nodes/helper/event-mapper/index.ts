import { Node } from "node-red";
import { RED } from "../../../globals";
import { BaseNodeDebounceData } from "../../flowctrl/base/types";
import MatchJoinNode from "../../flowctrl/match-join";
import { NodeType } from "../../types";
import {
  defaultEventMapperNodeConfig,
  EventMapperNodeConfig,
  EventMapperNodeType,
  EventMapperRule,
} from "./types";

export default class EventMapperNode extends MatchJoinNode<EventMapperNodeConfig> {
  static get type(): NodeType {
    return EventMapperNodeType;
  }

  constructor(node: Node, config: EventMapperNodeConfig) {
    config = { ...defaultEventMapperNodeConfig, ...config };

    super(node, config);
  }

  protected debounceListener(data: BaseNodeDebounceData): void {
    const input = data.result;

    if (!input.event) {
      return;
    }

    const rule = this.getRule(input.event);
    if (!rule) {
      if (!this.config.ignoreUnknownEvents) {
        this.node.error("No rule found for event", input.event);
      }
      return;
    }

    const msg = data.received_msg;

    const mapped = RED.util.evaluateNodeProperty(
      rule.mapped,
      rule.mappedType,
      this.node,
      msg
    );

    this.sendMsg(msg, { payload: mapped, output: rule.output });
    this.nodeStatus = new Date();
  }

  private getRule(event: string): EventMapperRule | undefined {
    return this.config.rules.find((rule) => rule.event === event);
  }
}
