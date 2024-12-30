import { EditorRED } from "node-red";
import BaseNode from "./nodes/flowctrl/base";
import BaseNodeEditor from "./nodes/flowctrl/base/editor";

declare const RED: EditorRED;

const nodes: Record<string, any> = {
  [BaseNode.nodeTypeName]: BaseNodeEditor,
};

let type: string;
for (type in nodes) {
  RED.nodes.registerType(type, nodes[type]);
}
