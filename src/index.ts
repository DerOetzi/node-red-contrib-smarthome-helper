import "module-alias/register";

import { FlowCtrlNodes } from "@flowctrl/nodes";
import { HelperNodes } from "@helper/nodes";
import { LogicalNodes } from "@logical/nodes";
import { OperatorNodes } from "@nodes/operator/nodes";
import { Node, NodeAPI } from "node-red";
import version from "./version";

const nodes = [
  ...FlowCtrlNodes,
  ...HelperNodes,
  ...LogicalNodes,
  ...OperatorNodes,
];

export default async (RED: NodeAPI): Promise<void> => {
  for (const NodeClass of nodes) {
    RED.log.info(
      `Registering node type ${NodeClass.NodeTypeName} for @deroetzi/node-red-contrib-smarthome-helper`
    );

    RED.nodes.registerType(
      NodeClass.NodeTypeName,
      function (this: Node, config: any) {
        RED.nodes.createNode(this, config);
        const node = this;
        (node as any).smarthomeHelperController = new (NodeClass as any)(
          RED,
          node,
          config
        );
        (node as any).smarthomeHelperController.registerListeners();
      }
    );
  }

  RED.log.info(
    `@deroetzi/node-red-contrib-smarthome-helper v${version} nodes initialized`
  );
};
