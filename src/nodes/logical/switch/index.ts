import { Node } from "node-red";
import { SendHandler } from "../../../common/sendhandler";
import { RED } from "../../../globals";
import { BaseNodeConfig } from "../../types";

interface SwitchNodeConfig extends BaseNodeConfig {}

export default function SwitchNode(this: Node, config: SwitchNodeConfig): void {
  RED.nodes.createNode(this, config);
  const node = this;
  const sendHandler = new SendHandler(node, config, 2);

  node.status({ fill: "grey", shape: "ring", text: "no message" });

  node.on("input", (msg: any) => {
    let result = msg.payload;

    node.status({
      fill: result ? "green" : "red",
      shape: "dot",
      text: result.toString(),
    });

    if (result === true) {
      sendHandler.sendMsg(msg);
    } else if (result === false) {
      sendHandler.sendMsg(msg, null, 1);
    }
  });
}
