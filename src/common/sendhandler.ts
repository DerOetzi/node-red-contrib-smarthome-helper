import { RED } from "../globals";
import { NodeStateHandler, NodeStatusSendConfig } from "./statehandler";

const lastSentPayloadsKey = "lastSentPayloads";

export interface NodeSendHandlerOptions {
  send?: any;
  payload?: any;
  output?: number;
  additionalAttributes?: Record<string, any>;
}

export class NodeSendHandler {
  constructor(
    private readonly stateHandler: NodeStateHandler,
    private readonly outputs: number = 1,
    statusOutputConfig?: NodeStatusSendConfig
  ) {
    if (statusOutputConfig) {
      statusOutputConfig.sendHandler = this;
      stateHandler.registerStatusOutput(statusOutputConfig);
    }
  }

  sendMsg(received_msg: any, options: NodeSendHandlerOptions = {}) {
    const topicValue = RED.util.evaluateNodeProperty(
      this.stateHandler.config.topic,
      this.stateHandler.config.topicType,
      this.stateHandler.node,
      received_msg
    );

    const payload = options.payload ?? received_msg.payload;

    let msg: any;
    if (this.stateHandler.config.newMsg ?? false) {
      msg = { payload: payload, topic: topicValue };
    } else {
      msg = received_msg;
      msg.payload = payload;
      msg.topic = topicValue;
    }

    if (this.stateHandler.config.filterUniquePayload ?? false) {
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

    const send =
      options.send ?? this.stateHandler.node.send.bind(this.stateHandler.node);
    send(msgs);
  }
}
