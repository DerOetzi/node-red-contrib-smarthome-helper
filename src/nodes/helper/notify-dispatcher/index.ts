import { Node } from "node-red";
import { BaseNodeDebounceData } from "../../flowctrl/base/types";
import MatchJoinNode from "../../flowctrl/match-join";
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

  protected debounceListener(data: BaseNodeDebounceData): void {
    const msg = data.received_msg;

    if (msg.topic === "message") {
      const notify = msg.notify as NotifyMessage;
      let found = false;
      const onlyAtHome = notify.onlyAtHome ?? false;
      if (onlyAtHome) {
        this.config.matchers.forEach((matcher, index) => {
          let target = matcher.target;
          if (target.startsWith("person")) {
            const person = data.result[target];
            if (person === true) {
              this.sendMsg(msg, {
                payload: notify,
                send: data.send,
                output: index + 1,
                additionalAttributes: { input: data.result },
              });
              found = true;
            }
          }
        });
      }

      if (!(onlyAtHome && found)) {
        this.sendMsg(msg, {
          payload: notify,
          send: data.send,
          additionalAttributes: { input: data.result },
        });
      }

      this.nodeStatus = new Date();
    }
  }
}
