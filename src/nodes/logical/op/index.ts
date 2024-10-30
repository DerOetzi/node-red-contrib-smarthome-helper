import { Node, NodeStatusFill } from "node-red";
import { NodeSendHandler } from "../../../common/sendhandler";
import { NodeStateHandler } from "../../../common/statehandler";
import { RED } from "../../../globals";
import { CommonNodeConfig } from "../../flowctrl/common";
import {
  andOp,
  nandOp,
  norOp,
  notOp,
  nxorOp,
  orOp,
  xorOp,
} from "../operations";

interface LogicalOperationNodeConfig extends CommonNodeConfig {
  logical: string;
  minMsgCount: number;
}

const operations: Record<string, any> = {
  not: notOp,
  and: andOp,
  nand: nandOp,
  or: orOp,
  nor: norOp,
  xor: xorOp,
  nxor: nxorOp,
};

export default function LogicalOperationNode(
  this: Node,
  config: LogicalOperationNodeConfig
): void {
  RED.nodes.createNode(this, config);

  const node = this;

  const stateHandler = new NodeStateHandler(node, config, {
    statusColor: statusColor,
  });
  const sendHandler = new NodeSendHandler(stateHandler, 1);

  const logical = config.logical ?? "and";
  const minMsgCount = config.minMsgCount ?? 1;

  const operator = operations[logical];

  node.on("input", (msg: any, send: any, done: any) => {
    if (typeof msg.payload !== "boolean") {
      node.error("Payload must be a boolean value");
      return;
    }

    if (logical === "not") {
      sendResult(msg, send, notOp(msg.payload));
    } else {
      if (typeof msg.topic !== "string") {
        node.error("Topic must be a string");
        return;
      }

      const messages = stateHandler.getRecordFromContext("messagesStore");
      messages[msg.topic] = msg.payload;
      stateHandler.setToContext("messagesStore", messages);

      if (Object.keys(messages).length >= minMsgCount) {
        const payloads = Object.values(messages);
        sendResult(msg, send, operator(payloads), messages);
      } else {
        stateHandler.nodeStatus = "waiting";
      }
    }

    if (done) {
      done();
    }
  });

  function sendResult(
    msg: any,
    send: any,
    result: boolean,
    messages: Record<string, any> = {}
  ): void {
    stateHandler.nodeStatus = result;
    sendHandler.sendMsg(msg, {
      send,
      payload: result,
      additionalAttributes: { messages: messages },
    });
  }

  function statusColor(status: any): NodeStatusFill {
    let color: NodeStatusFill = "red";
    if (status === null || status === undefined || status === "") {
      color = "grey";
    } else if (status === "waiting") {
      color = "yellow";
    } else if (status) {
      color = "green";
    }

    return color;
  }
}
