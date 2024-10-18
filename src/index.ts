import { NodeAPI } from "node-red";
import { setRED } from "./globals";
import version from "./version";
import { NodeType } from "./const";
import AutomationGateNode from "./nodes/flowctrl/automation-gate";
import GateControlNode from "./nodes/flowctrl/gate-control";
import LogicalOperationNode from "./nodes/logical/op";
import CompareNode from "./nodes/logical/compare";

const nodes: Record<string, any> = {
  [NodeType.AutomationGate.fullName]: AutomationGateNode,
  [NodeType.GateControl.fullName]: GateControlNode,
  [NodeType.LogicalOp.fullName]: LogicalOperationNode,
  [NodeType.Compare.fullName]: CompareNode,
};

export default async (RED: NodeAPI): Promise<void> => {
  setRED(RED);
  let type: string;
  for (type in nodes) {
    RED.log.info(
      `Registering node type ${type} for @deroetzi/node-red-contrib-smarthome-helper`
    );
    RED.nodes.registerType(type, nodes[type]);
  }

  RED.log.info(
    `@deroetzi/node-red-contrib-smarthome-helper v${version} nodes initialized`
  );
};
