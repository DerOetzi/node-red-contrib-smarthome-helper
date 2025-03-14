import { Node, NodeAPI } from "node-red";
import { FlowCtrlNodes } from "./nodes/flowctrl/nodes";
import { StatusNodesConnector } from "./nodes/flowctrl/status/connector";
import { HelperNodes } from "./nodes/helper/nodes";
import { LogicalNodes } from "./nodes/logical/nodes";
import { OperatorNodes } from "./nodes/operator/nodes";
import version from "./version";

const nodes = [
  ...FlowCtrlNodes,
  ...HelperNodes,
  ...LogicalNodes,
  ...OperatorNodes,
];

export default async (RED: NodeAPI): Promise<void> => {
  const statusNodesConnector = new StatusNodesConnector(RED);

  for (const NodeClass of nodes) {
    RED.log.info(
      `Registering node type ${NodeClass.NodeTypeName} for @deroetzi/node-red-contrib-smarthome-helper`
    );

    RED.nodes.registerType(
      NodeClass.NodeTypeName,
      function (this: Node, config: any) {
        RED.nodes.createNode(this, config);
        const node = this;
        const smarthomeHelperController = new (NodeClass as any)(
          RED,
          node,
          config
        );

        smarthomeHelperController.register(statusNodesConnector);
      }
    );
  }

  RED.log.info(
    `@deroetzi/node-red-contrib-smarthome-helper v${version} nodes initialized`
  );
};
