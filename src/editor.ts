import { EditorNodeInstance, EditorRED } from "node-red";
import {
  FlowCtrlDefs,
  FlowCtrlBaseNode,
  FlowCtrlBaseEditorNode,
  FlowCtrlBaseEditorTemplate,
  FlowCtrlBaseEditorMetadata,
} from "./nodes/flowctrl/nodes";
import { HelperDefs } from "./nodes/helper/nodes";
import { LogicalDefs } from "./nodes/logical/nodes";
import { OperatorDefs } from "./nodes/operator/nodes";
import { EditorMetadata, EditorTemplateElement } from "./nodes/types";

import version from "./version";
import {
  i18n,
  generateNodeHelp,
  buildEditorTemplate,
  buildEditorNodeDef,
  buildEditorMetadata,
  NodeEditorDefinition,
} from "./nodes/flowctrl/base/editor";

declare const RED: EditorRED;

const allDefs: NodeEditorDefinition[] = [
  ...FlowCtrlDefs,
  ...HelperDefs,
  ...LogicalDefs,
  ...OperatorDefs,
];

console.log("Smart Home Helper - version:", version || "unknown");

const $migrationButton = createMigrationElements();

RED.events.on("editor:open", checkAndMigrateNode);
RED.events.on("nodes:add", checkNode);

// Register BaseNode specially (not covered by NodeEditorDefinition pattern)
injectNodeTemplate(FlowCtrlBaseNode.NodeTypeName, FlowCtrlBaseEditorTemplate);
RED.nodes.registerType(FlowCtrlBaseNode.NodeTypeName, FlowCtrlBaseEditorNode);
setTimeout(
  () =>
    injectNodeHelp(
      FlowCtrlBaseNode.NodeTypeName,
      FlowCtrlBaseEditorNode,
      FlowCtrlBaseEditorMetadata,
    ),
  100,
);

// Register all nodes centrally from their NodeEditorDefinition
for (const def of allDefs) {
  const type = def.nodeClass.NodeTypeName;
  const template = buildEditorTemplate(def);
  const editorDef = buildEditorNodeDef(def);
  const metadata = buildEditorMetadata(def);

  injectNodeTemplate(type, template);
  RED.nodes.registerType(type, editorDef);
  // Inject help text dynamically after a short delay to ensure i18n is loaded
  setTimeout(() => injectNodeHelp(type, editorDef, metadata), 100);
}

/**
 * Injects the editor template HTML for a node type as a <script type="text/html"> element.
 * Must be called before RED.nodes.registerType so the template is available at registration time.
 */
function injectNodeTemplate(
  nodeType: string,
  template?: EditorTemplateElement[],
) {
  if (!template || $(`script[data-template-name="${nodeType}"]`).length > 0) {
    return;
  }

  const html = template.map((el) => el.getString()).join("\n<hr/>\n");

  const script = document.createElement("script");
  script.setAttribute("type", "text/html");
  script.dataset.templateName = nodeType;
  script.innerHTML = html;
  document.body.appendChild(script);
}

/**
 * Injects help text dynamically for a node type using i18n
 * Calls outputLabels and observes the editor definition to discover what the node uses
 */
function injectNodeHelp(
  nodeType: string,
  editorDef: any,
  metadata?: EditorMetadata,
) {
  // Check if help already exists
  if ($(`script[data-help-name="${nodeType}"]`).length > 0) {
    return;
  }

  // Convert node type to locale prefix by replacing only the first separator.
  // Example: "flowctrl-automation-gate" -> "flowctrl.automation-gate"
  //          "helper-waste-reminder" -> "helper.waste-reminder"
  const localePrefix = toLocalePrefix(nodeType);

  // Generate help HTML using i18n and editor definition introspection
  const helpHtml = generateNodeHelp(
    nodeType,
    editorDef,
    localePrefix,
    metadata,
  );

  if (!helpHtml) {
    return; // No help content available
  }

  // Create and inject help script tag
  const helpScript = document.createElement("script");
  helpScript.setAttribute("type", "text/html");
  helpScript.dataset.helpName = nodeType;
  helpScript.innerHTML = helpHtml;
  document.body.appendChild(helpScript);
}

function toLocalePrefix(nodeType: string): string {
  const separatorIndex = nodeType.indexOf("-");
  if (separatorIndex < 0) {
    return nodeType;
  }

  return `${nodeType.slice(0, separatorIndex)}.${nodeType.slice(separatorIndex + 1)}`;
}

function checkAndMigrateNode() {
  const selection = RED.view.selection();
  const node =
    selection?.nodes?.length === 1
      ? (selection.nodes[0] as EditorNodeInstance<any>)
      : null;

  const def = findDefForNode(node);

  if (def) {
    def.nodeClass.Migration.checkAndMigrate(node);
  }
}

function checkNode(node: EditorNodeInstance<any>) {
  const def = findDefForNode(node);

  if (def) {
    const migrationNeeded = def.nodeClass.Migration.check(node);
    if (migrationNeeded) {
      console.log(
        `Smart Home Helper: Node ${node.z} - ${node.name || node.id} of type ${node.type} requires migration. Please open and re-save the node to apply the migration.`,
      );
      $migrationButton.show();
    }
  }
}

function findDefForNode(
  node: EditorNodeInstance<any> | null,
): NodeEditorDefinition | null {
  if (!node) {
    return null;
  }
  return allDefs.find((d) => d.nodeClass.NodeTypeName === node.type) ?? null;
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
    `,
  );

  const $migrationButtonHTML = $.parseHTML(
    `<li><button id="upgrade-smarthome-helper-node"><i class="fa fa-refresh"></i> ${buttonLabel}</button></li>`,
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
    const def = findDefForNode(node);
    if (def) {
      console.log(
        `Smart Home Helper: Checking node ${node.z} - ${node.name || node.id} of type ${node.type} for migration...`,
      );
      const migrated = def.nodeClass.Migration.checkAndMigrate(node);
      if (migrated) {
        console.log(
          `Smart Home Helper: Migrated node ${node.z} - ${node.name || node.id} of type ${node.type}.`,
        );
        migratedCount++;
      }
    }

    return true;
  };

  RED.nodes.eachNode(checkAndMigrate as any);

  const resultMessage = i18n("common.migration.result").replace(
    "{count}",
    migratedCount.toString(),
  );
  RED.notify(resultMessage);
  console.log(resultMessage);

  $migrationButton.hide();

  RED.view.redraw();
}
