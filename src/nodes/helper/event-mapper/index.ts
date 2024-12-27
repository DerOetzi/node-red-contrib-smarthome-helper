import { Node } from "node-red";
import { RED } from "../../../globals";
import MatchJoinNode from "../../flowctrl/match-join";
import { MatchJoinNodeData } from "../../flowctrl/match-join/types";
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

  protected matched(data: MatchJoinNodeData): void {
    const input = data.payload;

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

    data.payload = RED.util.evaluateNodeProperty(
      rule.mapped,
      rule.mappedType,
      this.node,
      data.received_msg
    );

    data.output = rule.output;

    this.debounce(data);
  }

  private getRule(event: string): EventMapperRule | undefined {
    return this.config.rules.find((rule) => rule.event === event);
  }
}
