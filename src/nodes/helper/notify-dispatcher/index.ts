import { Node } from "node-red";
import MatchJoinNode from "../../flowctrl/match-join";
import { MatchJoinNodeData } from "../../flowctrl/match-join/types";
import { NodeType } from "../../types";
import {
  defaultNotifyDispatcherNodeConfig,
  NotifyDispatcherNodeConfig,
  NotifyDispatcherNodeType,
  NotifyMessage,
} from "./types";

export default class NotifyDispatcherNode extends MatchJoinNode<NotifyDispatcherNodeConfig> {
  constructor(node: Node, config: NotifyDispatcherNodeConfig) {
    config = { ...defaultNotifyDispatcherNodeConfig, ...config };

    config.matchers.push({
      property: "notify",
      propertyType: "msg",
      operator: "not_empty",
      compare: "",
      compareType: "str",
      target: "message",
      targetType: "str",
    });

    super(node, config);
  }

  static get type(): NodeType {
    return NotifyDispatcherNodeType;
  }

  protected matched(data: MatchJoinNodeData): void {
    const msg = data.received_msg;

    if (msg.topic === "message") {
      const notify = msg.notify as NotifyMessage;
      data.payload = notify;

      let found = false;
      const onlyAtHome = notify.onlyAtHome ?? false;
      if (onlyAtHome) {
        this.config.matchers.forEach((matcher, index) => {
          let target = matcher.target;
          if (target.startsWith("person")) {
            const person = data.input[target];
            if (person === true) {
              data.output = index + 1;
              this.debounce(data);
              found = true;
            }
          }
        });
      }

      if (!(onlyAtHome && found)) {
        data.output = 0;
        this.debounce(data);
      }
    }
  }
}
