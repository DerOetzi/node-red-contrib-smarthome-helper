import { Node, NodeAPI } from "node-red";
import { NodeMessageFlow } from "../../../flowctrl/base/types";
import MatchJoinNode from "../../../flowctrl/match-join";
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

  protected matched(messageFlow: NodeMessageFlow): void {
    const event: string = messageFlow.payload as string;

    const rule = this.getRule(event);
    if (!rule) {
      if (event && !this.config.ignoreUnknownEvents) {
        this.node.error("No rule found for event: " + event);
      }
      return;
    }

    messageFlow.payload = this.RED.util.evaluateNodeProperty(
      rule.mapped,
      rule.mappedType,
      this.node,
      messageFlow.originalMsg
    );

    messageFlow.output = rule.output!;

    this.debounce(messageFlow);
  }

  private getRule(event: string): EventMapperRule | undefined {
    const rule = this.config.rules.find((rule) => rule.event === event);
    if (rule) {
      rule.output = this.config.rules.indexOf(rule);
    }
    return rule;
  }
}
