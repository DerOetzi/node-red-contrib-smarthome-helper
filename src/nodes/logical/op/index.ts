import { Node } from "node-red";
import { SendHandler } from "../../../common/sendhandler";
import { RED } from "../../../globals";
import { BaseNodeConfig } from "../../types";
import {
  andOp,
  nandOp,
  norOp,
  notOp,
  nxorOp,
  orOp,
  xorOp,
} from "../operations";

interface LogicalOperationNodeConfig extends BaseNodeConfig {
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
  const sendHandler = new SendHandler(node, config, 1);

  const context = node.context();

  const logical = config.logical ?? "and";
  const minMsgCount = config.minMsgCount ?? 1;

  const operator = operations[logical];

  node.status({ fill: "grey", shape: "ring", text: "no message" });

  node.on("input", (msg: any) => {
    if (logical === "not") {
      sendResult(msg, notOp(msg.payload));
    } else {
      const topics: Record<string, any> = context.get("topics") || {};
      topics[msg.topic] = msg.payload;
      context.set("topics", topics);

      if (Object.keys(topics).length >= minMsgCount) {
        const payloads = Object.values(topics);
        sendResult(msg, operator(payloads));
      } else {
        node.status({ fill: "yellow", shape: "ring", text: "waiting" });
      }
    }
  });

  function sendResult(msg: any, result: boolean): void {
    node.status({
      fill: result ? "green" : "red",
      shape: "dot",
      text: result.toString(),
    });

    sendHandler.sendMsg(msg, result);
  }
}
