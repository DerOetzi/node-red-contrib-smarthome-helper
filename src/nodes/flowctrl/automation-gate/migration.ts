import { Migration } from "@base/migration";
import { EditorNodeInstance } from "node-red";
import { AutomationGateEditorNodeProperties } from "./types";

class AutomationGateMigration extends Migration<AutomationGateEditorNodeProperties> {
  public checkAndMigrate(
    node: EditorNodeInstance<AutomationGateEditorNodeProperties>
  ): boolean {
    if (this.check(node, "0.22.3")) {
      node = this.migrateStatusDelay(node);
      node.migrated = true;
    }

    return this.migrate(node);
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

export const automationGateMigration = new AutomationGateMigration();
