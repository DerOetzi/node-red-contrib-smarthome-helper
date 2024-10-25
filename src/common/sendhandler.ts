import { Node } from "node-red";
import { RED } from "../globals";
import { BaseNodeConfig } from "../nodes/types";
import { NodeStateHandler, NodeStatusSendConfig } from "./statehandler";

const lastSentPayloadsKey = "lastSentPayloads";

export class NodeSendHandler {
  private readonly node: Node;

  constructor(
    private readonly stateHandler: NodeStateHandler,
    private readonly config: BaseNodeConfig,
    private readonly outputs: number = 1,
    statusOutputConfig?: NodeStatusSendConfig
  ) {
    this.node = stateHandler.node;

    if (statusOutputConfig) {
      statusOutputConfig.sendHandler = this;
      stateHandler.registerStatusOutput(statusOutputConfig);
    }
  }

  sendMsg(received_msg: any, payload: any = null, output: number = 0) {
    const topicValue = RED.util.evaluateNodeProperty(
      this.config.topic,
      this.config.topicType,
      this.node,
      received_msg
    );

    payload = payload ?? received_msg.payload;

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
        this.sendMsgToOutput(msg, output);
        lastSentPayloads[msg.topic] = msg.payload;
        this.stateHandler.setToContext(lastSentPayloadsKey, lastSentPayloads);
      }
    } else {
      this.sendMsgToOutput(msg, output);
    }
  }

  resetFilter() {
    this.stateHandler.removeFromContext(lastSentPayloadsKey);
  }

  sendMsgToOutput(msg: any, output: number = 0) {
    let msgs = Array(this.outputs).fill(null);
    msgs[output] = msg;
    this.node.send(msgs);
  }
}
