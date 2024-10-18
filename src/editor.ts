import { EditorRED } from "node-red";
import { NodeType } from "./const";
import AutomationGateNodeEditor from "./nodes/flowctrl/automation-gate/editor";
import GateControlNodeEditor from "./nodes/flowctrl/gate-control/editor";
import LogicalOpNodeEditor from "./nodes/logical/op/editor";
import CompareNodeEditor from "./nodes/logical/compare/editor";

declare const RED: EditorRED;

const nodes: Record<string, any> = {
  [NodeType.AutomationGate.fullName]: AutomationGateNodeEditor,
  [NodeType.GateControl.fullName]: GateControlNodeEditor,
  [NodeType.LogicalOp.fullName]: LogicalOpNodeEditor,
  [NodeType.Compare.fullName]: CompareNodeEditor,
};

let type: string;
for (type in nodes) {
  RED.nodes.registerType(type, nodes[type]);
}
