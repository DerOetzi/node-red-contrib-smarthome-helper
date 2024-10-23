import { BaseNodeConfig } from "../nodes/types";
import { RED } from "../globals";
import { Node } from "node-red";

export class SendHandler {
  private readonly context;

  constructor(
    private readonly node: Node,
    private readonly config: BaseNodeConfig,
    private readonly outputs: number = 1
  ) {
    this.context = this.node.context();
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
        this.context.get("lastSentPayloads") || {};

      if (lastSentPayloads[msg.topic] !== msg.payload) {
        this.sendMsgToOutput(msg, output);
        lastSentPayloads[msg.topic] = msg.payload;
        this.context.set("lastSentPayloads", lastSentPayloads);
      }
    } else {
      this.sendMsgToOutput(msg, output);
    }
  }

  resetFilter() {
    this.context.set("lastSentPayloads", {});
  }

  sendMsgToOutput(msg: any, output: number = 0) {
    let msgs = Array(this.outputs).fill(null);
    msgs[output] = msg;

    this.node.send(msgs);
  }
}
