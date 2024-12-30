import { Node, NodeAPI } from "node-red";
import BaseNode from "./nodes/flowctrl/base";
import version from "./version";

const nodes = [BaseNode];

export default async (RED: NodeAPI): Promise<void> => {
  for (const NodeClass of nodes) {
    RED.log.info(
      `Registering node type ${NodeClass.nodeTypeName} for @deroetzi/node-red-contrib-smarthome-helper`
    );
    RED.nodes.registerType(
      NodeClass.nodeTypeName,
      function (this: Node, config: any) {
        RED.nodes.createNode(this, config);
        const node = this;
        const nodeController = new NodeClass(RED, node, config);
        nodeController.registerListenerAndInitialize();
      }
    );
  }

  RED.log.info(
    `@deroetzi/node-red-contrib-smarthome-helper v${version} nodes initialized`
  );
};
