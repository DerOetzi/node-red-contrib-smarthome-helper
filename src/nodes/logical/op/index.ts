import { Node, NodeStatusFill } from "node-red";
import { NodeSendHandler } from "../../../common/sendhandler";
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
import { NodeStateHandler } from "../../../common/statehandler";

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

  const stateHandler = new NodeStateHandler(node, { statusColor: statusColor });
  const sendHandler = new NodeSendHandler(stateHandler, config, 1);

  const logical = config.logical ?? "and";
  const minMsgCount = config.minMsgCount ?? 1;

  const operator = operations[logical];

  node.on("input", (msg: any) => {
    if (logical === "not") {
      sendResult(msg, notOp(msg.payload));
    } else {
      const topics = stateHandler.getRecordFromContext("topics");
      topics[msg.topic] = msg.payload;
      stateHandler.setToContext("topics", topics);

      if (Object.keys(topics).length >= minMsgCount) {
        const payloads = Object.values(topics);
        sendResult(msg, operator(payloads));
      } else {
        stateHandler.nodeStatus = "waiting";
      }
    }
  });

  function sendResult(msg: any, result: boolean): void {
    stateHandler.nodeStatus = result;
    sendHandler.sendMsg(msg, result);
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
