import { NodeAPI } from "node-red";
import { setRED } from "./globals";
import version from "./version";
import { NodeType } from "./const";
import AutomationGateNode from "./nodes/flowctrl/automation-gate";
import GateControlNode from "./nodes/flowctrl/gate-control";
import LogicalOperationNode from "./nodes/logical/op";
import CompareNode from "./nodes/logical/compare";
import SwitchNode from "./nodes/logical/switch";
import CommonNode from "./nodes/flowctrl/common";

const nodes: Record<string, any> = {
  [NodeType.FlowCtrlCommon.fullName]: CommonNode,
  [NodeType.FlowCtrlAutomationGate.fullName]: AutomationGateNode,
  [NodeType.FlowCtrlGateControl.fullName]: GateControlNode,
  [NodeType.LogicalOp.fullName]: LogicalOperationNode,
  [NodeType.LogicalCompare.fullName]: CompareNode,
  [NodeType.LogicalSwitch.fullName]: SwitchNode,
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
