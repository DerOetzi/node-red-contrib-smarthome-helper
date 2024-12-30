import { EditorRED } from "node-red";
import AutomationGateNode from "./nodes/flowctrl/automation-gate";
import AutomationGateNodeEditor from "./nodes/flowctrl/automation-gate/editor";
import BaseNode from "./nodes/flowctrl/base";
import BaseNodeEditor from "./nodes/flowctrl/base/editor";

declare const RED: EditorRED;

const nodes: Record<string, any> = {
  [AutomationGateNode.nodeTypeName]: AutomationGateNodeEditor,
  [BaseNode.nodeTypeName]: BaseNodeEditor,
};

let type: string;
for (type in nodes) {
  RED.nodes.registerType(type, nodes[type]);
}
