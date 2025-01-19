import { Node, NodeAPI } from "node-red";
import MatchJoinNode from "../../flowctrl/match-join";
import { MatchJoinNodeData } from "../../flowctrl/match-join/types";
import { NodeCategory, NodeColor } from "../../types";
import { helperCategory } from "../types";
import {
  EventMapperNodeDef,
  EventMapperNodeOptions,
  EventMapperNodeOptionsDefaults,
  EventMapperRule,
} from "./types";

export default class EventMapperNode extends MatchJoinNode<
  EventMapperNodeDef,
  EventMapperNodeOptions
> {
  public static readonly NodeCategory: NodeCategory = helperCategory;
  public static readonly NodeType: string = "event-mapper";
  public static readonly NodeColor: NodeColor = NodeColor.Switch;

  constructor(RED: NodeAPI, node: Node, config: EventMapperNodeDef) {
    super(RED, node, config, EventMapperNodeOptionsDefaults);
  }

  protected matched(data: MatchJoinNodeData): void {
    const event: string = data.payload as string;

    const rule = this.getRule(event);
    if (!rule) {
      if (!(this.config.ignoreUnknownEvents && event)) {
        this.node.error("No rule found for event: " + event);
      }
      return;
    }

    data.payload = this.RED.util.evaluateNodeProperty(
      rule.mapped,
      rule.mappedType,
      this.node,
      data.msg
    );

    data.output = rule.output;

    this.debounce(data);
  }

  private getRule(event: string): EventMapperRule | undefined {
    const rule = this.config.rules.find((rule) => rule.event === event);
    if (rule) {
      rule.output = this.config.rules.indexOf(rule);
    }
    return rule;
  }
}
