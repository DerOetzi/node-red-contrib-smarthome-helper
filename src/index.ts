import { Node, NodeAPI } from "node-red";
import { FlowCtrlDefs, FlowCtrlBaseNode } from "./nodes/flowctrl/nodes";
import { StatusNodesConnector } from "./nodes/flowctrl/status/connector";
import { HelperDefs } from "./nodes/helper/nodes";
import { LogicalDefs } from "./nodes/logical/nodes";
import { OperatorDefs } from "./nodes/operator/nodes";
import { NodeEditorDefinition } from "./nodes/flowctrl/base/editor";
import version from "./version";

const allDefs: NodeEditorDefinition[] = [
  ...FlowCtrlDefs,
  ...HelperDefs,
  ...LogicalDefs,
  ...OperatorDefs,
];

export default async (RED: NodeAPI): Promise<void> => {
  const statusNodesConnector = new StatusNodesConnector(RED);

  // BaseNode is a special case not covered by NodeEditorDefinition
  RED.nodes.registerType(
    FlowCtrlBaseNode.NodeTypeName,
    function (this: Node, config: any) {
      RED.nodes.createNode(this, config);
      new FlowCtrlBaseNode(RED, this, config).register(statusNodesConnector);
    },
  );

  for (const def of allDefs) {
    const NodeClass = def.nodeClass;
    RED.log.info(
      `Registering node type ${NodeClass.NodeTypeName} for @deroetzi/node-red-contrib-smarthome-helper`,
    );

    RED.nodes.registerType(
      NodeClass.NodeTypeName,
      function (this: Node, config: any) {
        RED.nodes.createNode(this, config);
        const smarthomeHelperController = new (NodeClass as any)(
          RED,
          this,
          config,
        );
        smarthomeHelperController.register(statusNodesConnector);
      },
    );
  }

  RED.log.info(
    `@deroetzi/node-red-contrib-smarthome-helper v${version} nodes initialized`,
  );
};
