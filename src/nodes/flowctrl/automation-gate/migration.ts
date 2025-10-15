import { EditorNodeInstance } from "node-red";
import Migration from "../base/migration";
import { AutomationGateEditorNodeProperties } from "./types";

export default class AutomationGateMigration extends Migration<AutomationGateEditorNodeProperties> {
  protected _migrationSteps(
    node: EditorNodeInstance<AutomationGateEditorNodeProperties>
  ): EditorNodeInstance<AutomationGateEditorNodeProperties> {
    if (this.checkMigrationStepRequired(node, "0.22.3")) {
      node = this.migrateStatusDelay(node);
      node.migrated = true;
    }

    if (this.checkMigrationStepRequired(node, "0.27.1")) {
      node.outputs = 1;
      node.migrated = true;
    }

    return super._migrationSteps(node);
  }

  private migrateStatusDelay(
    node: EditorNodeInstance<AutomationGateEditorNodeProperties>
  ): EditorNodeInstance<AutomationGateEditorNodeProperties> {
    if (node.statusDelay) {
      delete node.statusDelay;
    }
    return node;
  }
}
