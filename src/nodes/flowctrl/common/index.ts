import { Node, NodeDef } from "node-red";
import { NodeSendHandler } from "../../../common/sendhandler";
import { NodeStateHandler } from "../../../common/statehandler";
import { RED } from "../../../globals";

export interface CommonNodeConfig extends NodeDef {
  topic: string;
  topicType: string;
  debounce: boolean;
  debounceTime: number;
  debounceUnit: string;
  debounceLeading: boolean;
  debounceTrailing: boolean;
  filterUniquePayload: boolean;
  newMsg: boolean;
}

export default function CommonNode(this: Node, config: CommonNodeConfig): void {
  RED.nodes.createNode(this, config);

  const node = this;

  const stateHandler = new NodeStateHandler(node, config);

  const sendHandler = new NodeSendHandler(stateHandler, 1);

  node.on("input", (msg: any, send: any, done: any) => {
    sendHandler.sendMsg(msg, { send });

    if (done) {
      done();
    }
  });
}
