import { NodeAPI } from "node-red";
import { setRED } from "./globals";
import version from "./version";
import { NodeType } from "./const";
import createAutomationGateNode from "./nodes/flowctrl/automation-gate";
import GateControlNode from "./nodes/flowctrl/gate-control";
import LogicalOperationNode from "./nodes/logical/op";
import CompareNode from "./nodes/logical/compare";
import createSwitchNode from "./nodes/logical/switch";
import createBaseNode from "./nodes/flowctrl/base";

const nodes: Record<string, any> = {
  [NodeType.FlowCtrlBase.fullName]: createBaseNode,
  [NodeType.FlowCtrlAutomationGate.fullName]: createAutomationGateNode,
  [NodeType.FlowCtrlGateControl.fullName]: GateControlNode,
  [NodeType.LogicalOp.fullName]: LogicalOperationNode,
  [NodeType.LogicalCompare.fullName]: CompareNode,
  [NodeType.LogicalSwitch.fullName]: createSwitchNode,
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
