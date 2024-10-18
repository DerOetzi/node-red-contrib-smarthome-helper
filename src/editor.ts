import { EditorRED } from "node-red";
import { NodeType } from "./const";
import AutomationGateNodeEditor from "./nodes/flow_control/automation-gate/editor";
import GateControlNodeEditor from "./nodes/flow_control/gate-control/editor";

declare const RED: EditorRED;

RED.nodes.registerType(NodeType.AutomationGate, AutomationGateNodeEditor);
RED.nodes.registerType(NodeType.GateControl, GateControlNodeEditor);
