import { EditorNodeInstance, EditorRED } from "node-red";
import { FlowCtrlNodesRegistry } from "./nodes/flowctrl/nodes";
import { HelperNodesRegistry } from "./nodes/helper/nodes";
import { LogicalNodesRegistry } from "./nodes/logical/nodes";
import { OperatorNodesRegistry } from "./nodes/operator/nodes";
import { NodeRegistryEntry } from "./nodes/types";

import version from "./version";
import { i18n, generateNodeHelp } from "nodes/flowctrl/base/editor";

declare const RED: EditorRED;

const nodesRegistry: { [key: string]: NodeRegistryEntry } = {
  ...FlowCtrlNodesRegistry,
  ...HelperNodesRegistry,
  ...LogicalNodesRegistry,
  ...OperatorNodesRegistry,
};

console.log("Smart Home Helper - version:", version || "unknown");

const $migrationButton = createMigrationElements();

RED.events.on("editor:open", checkAndMigrateNode);
RED.events.on("nodes:add", checkNode);

// Register all nodes and inject help dynamically
for (const [type, entry] of Object.entries(nodesRegistry)) {
  RED.nodes.registerType(type, entry.editor);
  // Inject help text dynamically after a short delay to ensure i18n is loaded
  setTimeout(() => injectNodeHelp(type), 100);
}

/**
 * Injects help text dynamically for a node type using i18n
 */
function injectNodeHelp(nodeType: string) {
  // Check if help already exists
  if ($(`script[data-help-name="${nodeType}"]`).length > 0) {
    return;
  }

  // Convert node type to locale prefix (e.g., "flowctrl-automation-gate" -> "flowctrl.automation-gate")
  const localePrefix = nodeType.replace(/-/g, ".");

  // Generate help HTML using i18n
  const helpHtml = generateNodeHelp(localePrefix);

  if (!helpHtml) {
    return; // No help content available
  }

  // Create and inject help script tag
  const helpScript = document.createElement("script");
  helpScript.setAttribute("type", "text/html");
  helpScript.setAttribute("data-help-name", nodeType);
  helpScript.innerHTML = helpHtml;
  document.body.appendChild(helpScript);
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

function checkNode(node: EditorNodeInstance<any>) {
  const entry = getNodeRegistryEntry(node);

  if (entry) {
    const migrationNeeded = entry.node.Migration.check(node);
    if (migrationNeeded) {
      console.log(
        `Smart Home Helper: Node ${node.z} - ${node.name || node.id} of type ${node.type} requires migration. Please open and re-save the node to apply the migration.`
      );
      $migrationButton.show();
    }
  }
}

function getNodeRegistryEntry(
  node: EditorNodeInstance<any> | null
): NodeRegistryEntry | null {
  if (!node) return null;
  return nodesRegistry[node.type] || null;
}

function createMigrationElements() {
  const title = i18n("common.migration.title");
  const message = i18n("common.migration.message");
  const attention = i18n("common.migration.attention");
  const warning = i18n("common.migration.warning");
  const buttonLabel = i18n("common.migration.buttonLabel");

  const $dialogHtml = $.parseHTML(
    `
    <div id="smarthome-helper-dialog-confirm" title="${title}">
      ${message}
      <div class="ui-state-error ha-alert-box"><strong>${attention}:</strong> ${warning}</div>
    </div>
    `
  );

  const $migrationButtonHTML = $.parseHTML(
    `<li><button id="upgrade-smarthome-helper-node"><i class="fa fa-refresh"></i> ${buttonLabel}</button></li>`
  );

  $("body").append($dialogHtml);
  $("#red-ui-header .red-ui-header-toolbar").prepend($migrationButtonHTML);

  return $("#upgrade-smarthome-helper-node")
    .on("click", openMigrationConfirmDialog)
    .hide();
}

function openMigrationConfirmDialog() {
  const ok = i18n("common.migration.ok");
  const cancel = i18n("common.migration.cancel");

  ($("#smarthome-helper-dialog-confirm") as any).dialog({
    resizable: false,
    height: "auto",
    width: 400,
    modal: true,
    buttons: {
      [ok]: function () {
        ($(this) as any).dialog("close");
        checkAndMigrateAllNodes();
      },
      [cancel]: function () {
        ($(this) as any).dialog("close");
      },
    },
  });
}

function checkAndMigrateAllNodes() {
  console.log("Smart Home Helper: Starting migration of all nodes...");

  let migratedCount = 0;

  const checkAndMigrate = (node: EditorNodeInstance<any>) => {
    const entry = getNodeRegistryEntry(node);
    if (entry) {
      console.log(
        `Smart Home Helper: Checking node ${node.z} - ${node.name || node.id} of type ${node.type} for migration...`
      );
      const migrated = entry.node.Migration.checkAndMigrate(node);
      if (migrated) {
        console.log(
          `Smart Home Helper: Migrated node ${node.z} - ${node.name || node.id} of type ${node.type}.`
        );
        migratedCount++;
      }
    }

    return true;
  };

  RED.nodes.eachNode(checkAndMigrate as (n: object) => boolean);

  const resultMessage = i18n("common.migration.result").replace(
    "{count}",
    migratedCount.toString()
  );
  RED.notify(resultMessage);
  console.log(resultMessage);

  $migrationButton.hide();

  RED.view.redraw();
}
