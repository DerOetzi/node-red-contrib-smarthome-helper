import { Node, NodeAPI } from "node-red";
import MatchJoinNode from "../../../flowctrl/match-join";
import { MatchJoinNodeData } from "../../../flowctrl/match-join/types";
import { NodeCategory } from "../../../types";
import { HelperControlCategory } from "../types";
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
  protected static readonly _nodeCategory: NodeCategory = HelperControlCategory;
  protected static readonly _nodeType: string = "event-mapper";

  constructor(RED: NodeAPI, node: Node, config: EventMapperNodeDef) {
    super(RED, node, config, EventMapperNodeOptionsDefaults);
  }

  protected matched(data: MatchJoinNodeData): void {
    const event: string = data.payload as string;

    const rule = this.getRule(event);
    if (!rule) {
      if (event && !this.config.ignoreUnknownEvents) {
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
