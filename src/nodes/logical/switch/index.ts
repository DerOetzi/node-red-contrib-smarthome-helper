import { Node } from "node-red";
import { CommonNodeConfig } from "../../flowctrl/common";
import { NodeSendHandler } from "../../../common/sendhandler";
import { NodeStateHandler } from "../../../common/statehandler";
import { RED } from "../../../globals";

export default function SwitchNode(this: Node, config: CommonNodeConfig): void {
  RED.nodes.createNode(this, config);

  const node = this;

  const stateHandler = new NodeStateHandler(node);

  const sendHandler = new NodeSendHandler(stateHandler, config, 2);

  node.on("input", (msg: any, send: any, done: any) => {
    let result = msg.payload;

    stateHandler.nodeStatus = result;

    if (result === true) {
      sendHandler.sendMsg(msg, { send });
    } else if (result === false) {
      sendHandler.sendMsg(msg, { send, output: 1 });
    }

    if (done) {
      done();
    }
  });
}
