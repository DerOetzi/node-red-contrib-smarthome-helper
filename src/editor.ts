import { EditorRED } from "node-red";
import { NodeType } from "./const";
import AutomationGateNodeEditor from "./nodes/flowctrl/automation-gate/editor";
import BaseNodeEditor from "./nodes/flowctrl/base/editor";
import GateControlNodeEditor from "./nodes/flowctrl/gate-control/editor";
import MatchJoinNodeEditor from "./nodes/flowctrl/match-join/editor";
import CompareNodeEditor from "./nodes/logical/compare/editor";
import LogicalOpNodeEditor from "./nodes/logical/op/editor";
import SwitchNodeEditor from "./nodes/logical/switch/editor";

declare const RED: EditorRED;

const nodes: Record<string, any> = {
  [NodeType.FlowCtrlBase.fullName]: BaseNodeEditor,
  [NodeType.FlowCtrlAutomationGate.fullName]: AutomationGateNodeEditor,
  [NodeType.FlowCtrlGateControl.fullName]: GateControlNodeEditor,
  [NodeType.FlowCtrlMatchJoin.fullName]: MatchJoinNodeEditor,
  [NodeType.LogicalOp.fullName]: LogicalOpNodeEditor,
  [NodeType.LogicalCompare.fullName]: CompareNodeEditor,
  [NodeType.LogicalSwitch.fullName]: SwitchNodeEditor,
};

let type: string;
for (type in nodes) {
  RED.nodes.registerType(type, nodes[type]);
}
