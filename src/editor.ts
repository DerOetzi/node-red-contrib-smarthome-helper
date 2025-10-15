import { EditorNodeInstance, EditorRED } from "node-red";
import { FlowCtrlNodesRegistry } from "./nodes/flowctrl/nodes";
import { HelperNodesRegistry } from "./nodes/helper/nodes";
import { LogicalNodesRegistry } from "./nodes/logical/nodes";
import { OperatorNodesRegistry } from "./nodes/operator/nodes";
import { NodeRegistryEntry } from "./nodes/types";

import version from "./version";

declare const RED: EditorRED;

const nodesRegistry: { [key: string]: NodeRegistryEntry } = {
  ...FlowCtrlNodesRegistry,
  ...HelperNodesRegistry,
  ...LogicalNodesRegistry,
  ...OperatorNodesRegistry,
};

console.log("Smart Home Helper - version:", version || "unknown");

RED.events.on("editor:open", checkAndMigrateNode);

for (const [type, entry] of Object.entries(nodesRegistry)) {
  RED.nodes.registerType(type, entry.editor);
}

function checkAndMigrateNode() {
  const selection = RED.view.selection();
  const node =
    selection?.nodes?.length === 1
      ? (selection.nodes[0] as EditorNodeInstance<any>)
      : null;

  const entry = getNodeRegistryEntry(node);

  if (entry) {
    entry.node.Migration.checkAndMigrate(node);
  }
}
function getNodeRegistryEntry(
  node: EditorNodeInstance<any> | null
): NodeRegistryEntry | null {
  if (!node) return null;
  return nodesRegistry[node.type] || null;
}
