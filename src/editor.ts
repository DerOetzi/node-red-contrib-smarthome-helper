import { EditorRED } from "node-red";
import { NodeType } from "./const";
import AutomationGateNodeEditor from "./nodes/flowctrl/automation-gate/editor";
import GateControlNodeEditor from "./nodes/flowctrl/gate-control/editor";
import CompareNodeEditor from "./nodes/logical/compare/editor";
import LogicalOpNodeEditor from "./nodes/logical/op/editor";
import SwitchNodeEditor from "./nodes/logical/switch/editor";
import CommonNodeEditor from "./nodes/flowctrl/common/editor";

declare const RED: EditorRED;

const nodes: Record<string, any> = {
  [NodeType.FlowCtrlCommon.fullName]: CommonNodeEditor,
  [NodeType.FlowCtrlAutomationGate.fullName]: AutomationGateNodeEditor,
  [NodeType.FlowCtrlGateControl.fullName]: GateControlNodeEditor,
  [NodeType.LogicalOp.fullName]: LogicalOpNodeEditor,
  [NodeType.LogicalCompare.fullName]: CompareNodeEditor,
  [NodeType.LogicalSwitch.fullName]: SwitchNodeEditor,
};

let type: string;
for (type in nodes) {
  RED.nodes.registerType(type, nodes[type]);
}
