import { EditorNodeInstance } from "node-red";
import { AutomationGateCommand } from "../automation-gate/types";
import Migration from "../base/migration";
import { GateControlEditorNodeProperties } from "./types";

export default class GateControlMigration extends Migration<GateControlEditorNodeProperties> {
  protected _migrationSteps(
    node: EditorNodeInstance<GateControlEditorNodeProperties>
  ): EditorNodeInstance<GateControlEditorNodeProperties> {
    if (this.checkMigrationStepRequired(node, "0.35.0")) {
      if (node.gateCommand === AutomationGateCommand.ResetFilterDeprecated) {
        node.gateCommand = AutomationGateCommand.ResetFilter;
      }
      node.migrated = true;
    }

    return super._migrationSteps(node);
  }
}
