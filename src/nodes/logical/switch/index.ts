import { Node } from "node-red";
import { NodeSendHandler } from "../../../common/sendhandler";
import { NodeStateHandler } from "../../../common/statehandler";
import { RED } from "../../../globals";
import { BaseNodeConfig } from "../../types";

interface SwitchNodeConfig extends BaseNodeConfig {}

export default function SwitchNode(this: Node, config: SwitchNodeConfig): void {
  RED.nodes.createNode(this, config);

  const node = this;

  const stateHandler = new NodeStateHandler(node);

  const sendHandler = new NodeSendHandler(stateHandler, config, 2);

  node.on("input", (msg: any) => {
    let result = msg.payload;

    stateHandler.nodeStatus = result;

    if (result === true) {
      sendHandler.sendMsg(msg);
    } else if (result === false) {
      sendHandler.sendMsg(msg, null, 1);
    }
  });
}
