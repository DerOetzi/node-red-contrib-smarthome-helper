import { NodeAPI } from "node-red";
import { NodeType } from "./const";
import { setRED } from "./globals";
import createAutomationGateNode from "./nodes/flowctrl/automation-gate";
import createBaseNode from "./nodes/flowctrl/base";
import createGateControlNode from "./nodes/flowctrl/gate-control";
import createCompareNode from "./nodes/logical/compare";
import createLogicalOpNode from "./nodes/logical/op";
import createSwitchNode from "./nodes/logical/switch";
import version from "./version";
import createMatchJoinNode from "./nodes/flowctrl/match-join";

const nodes: Record<string, any> = {
  [NodeType.FlowCtrlBase.fullName]: createBaseNode,
  [NodeType.FlowCtrlAutomationGate.fullName]: createAutomationGateNode,
  [NodeType.FlowCtrlGateControl.fullName]: createGateControlNode,
  [NodeType.FlowCtrlMatchJoin.fullName]: createMatchJoinNode,
  [NodeType.LogicalOp.fullName]: createLogicalOpNode,
  [NodeType.LogicalCompare.fullName]: createCompareNode,
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
