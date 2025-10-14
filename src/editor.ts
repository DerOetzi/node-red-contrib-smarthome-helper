import { EditorRED } from "node-red";
import { FlowCtrlNodesRegistry } from "./nodes/flowctrl/nodes";
import { HelperNodesRegistry } from "./nodes/helper/nodes";
import { LogicalNodesRegistry } from "./nodes/logical/nodes";
import { OperatorNodesRegistry } from "./nodes/operator/nodes";
import { NodeRegistryEntry } from "./nodes/types";

declare const RED: EditorRED;

const nodesRegistry: { [key: string]: NodeRegistryEntry } = {
  ...FlowCtrlNodesRegistry,
  ...HelperNodesRegistry,
  ...LogicalNodesRegistry,
  ...OperatorNodesRegistry,
};

let type: string;
for (const [type, entry] of Object.entries(nodesRegistry)) {
  RED.nodes.registerType(type, entry.editor);
}
