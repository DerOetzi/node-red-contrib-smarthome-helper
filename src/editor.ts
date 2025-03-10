import { EditorRED } from "node-red";
import { FlowCtrlEditorNodes } from "./nodes/flowctrl/nodes";
import { HelperEditorNodes } from "./nodes/helper/nodes";
import { LogicalEditorNodes } from "./nodes/logical/nodes";
import { OperatorEditorNodes } from "./nodes/operator/nodes";

declare const RED: EditorRED;

const nodes: Record<string, any> = {
  ...FlowCtrlEditorNodes,
  ...HelperEditorNodes,
  ...LogicalEditorNodes,
  ...OperatorEditorNodes,
};

let type: string;
for (type in nodes) {
  RED.nodes.registerType(type, nodes[type]);
}
