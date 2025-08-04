import { EditorNodeInstance } from "node-red";
import { Migration } from "../base/migration";
import { GateControlEditorNodeProperties } from "./types";
import { AutomationGateCommand } from "../automation-gate/types";

class GateControlMigration extends Migration<GateControlEditorNodeProperties> {
  public checkAndMigrate(
    node: EditorNodeInstance<GateControlEditorNodeProperties>
  ): boolean {
    if (this.check(node, "0.35.0")) {
      if (node.gateCommand === AutomationGateCommand.ResetFilterDeprecated) {
        node.gateCommand = AutomationGateCommand.ResetFilter;
      }
      node.migrated = true;
    }

    return this.migrate(node);
  }
}

export const gateControlMigration = new GateControlMigration();
