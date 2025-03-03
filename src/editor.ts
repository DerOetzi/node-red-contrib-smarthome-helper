import { FlowCtrlEditorNodes } from "@flowctrl/nodes";
import { HelperEditorNodes } from "@helper/nodes";
import { LogicalEditorNodes } from "@logical/nodes";
import { OperatorEditorNodes } from "@nodes/operator/nodes";
import { EditorRED } from "node-red";

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
