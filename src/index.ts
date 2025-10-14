import { Node, NodeAPI } from "node-red";
import { FlowCtrlNodesRegistry } from "./nodes/flowctrl/nodes";
import { StatusNodesConnector } from "./nodes/flowctrl/status/connector";
import { HelperNodesRegistry } from "./nodes/helper/nodes";
import { LogicalNodesRegistry } from "./nodes/logical/nodes";
import { OperatorNodesRegistry } from "./nodes/operator/nodes";
import { NodeRegistryEntry } from "./nodes/types";
import version from "./version";

const nodesRegistry: { [key: string]: NodeRegistryEntry } = {
  ...FlowCtrlNodesRegistry,
  ...HelperNodesRegistry,
  ...LogicalNodesRegistry,
  ...OperatorNodesRegistry,
};

export default async (RED: NodeAPI): Promise<void> => {
  const statusNodesConnector = new StatusNodesConnector(RED);

  for (const [key, entry] of Object.entries(nodesRegistry)) {
    const NodeClass = entry.node;
    RED.log.info(
      `Registering node type ${key} for @deroetzi/node-red-contrib-smarthome-helper`
    );

    RED.nodes.registerType(
      NodeClass.NodeTypeName,
      function (this: Node, config: any) {
        RED.nodes.createNode(this, config);
        const node = this;
        const smarthomeHelperController = new NodeClass(RED, node, config);

        smarthomeHelperController.register(statusNodesConnector);
      }
    );
  }

  RED.log.info(
    `@deroetzi/node-red-contrib-smarthome-helper v${version} nodes initialized`
  );
};
