import { Node } from "node-red";
import { RED } from "../globals";
import { BaseNodeConfig } from "../nodes/types";
import { NodeStateHandler, NodeStatusSendConfig } from "./statehandler";
import { CommonNodeConfig } from "../nodes/flowctrl/common";

const lastSentPayloadsKey = "lastSentPayloads";

export interface NodeSendHandlerOptions {
  send?: any;
  payload?: any;
  output?: number;
  additionalAttributes?: Record<string, any>;
}

export class NodeSendHandler {
  private readonly node: Node;

  constructor(
    private readonly stateHandler: NodeStateHandler,
    private readonly config: CommonNodeConfig | BaseNodeConfig,
    private readonly outputs: number = 1,
    statusOutputConfig?: NodeStatusSendConfig
  ) {
    this.node = stateHandler.node;

    if (statusOutputConfig) {
      statusOutputConfig.sendHandler = this;
      stateHandler.registerStatusOutput(statusOutputConfig);
    }
  }

  sendMsg(received_msg: any, options: NodeSendHandlerOptions = {}) {
    const topicValue = RED.util.evaluateNodeProperty(
      this.config.topic,
      this.config.topicType,
      this.node,
      received_msg
    );

    const payload = options.payload ?? received_msg.payload;

    let msg: any;
    if (this.config.newMsg ?? false) {
      msg = { payload: payload, topic: topicValue };
    } else {
      msg = received_msg;
      msg.payload = payload;
      msg.topic = topicValue;
    }

    if (this.config.filterUniquePayload ?? false) {
      let lastSentPayloads: Record<string, any> =
        this.stateHandler.getRecordFromContext(lastSentPayloadsKey);

      if (lastSentPayloads[msg.topic] !== msg.payload) {
        this.sendMsgToOutput(msg, options);
        lastSentPayloads[msg.topic] = msg.payload;
        this.stateHandler.setToContext(lastSentPayloadsKey, lastSentPayloads);
      }
    } else {
      this.sendMsgToOutput(msg, options);
    }
  }

  resetFilter() {
    this.stateHandler.removeFromContext(lastSentPayloadsKey);
  }

  sendMsgToOutput(msg: any, options: NodeSendHandlerOptions = {}) {
    if (options.additionalAttributes) {
      Object.assign(msg, options.additionalAttributes);
    }

    let msgs = Array(this.outputs).fill(null);
    msgs[options.output ?? 0] = msg;

    const send = options.send ?? this.node.send.bind(this.node);
    send(msgs);
  }
}
