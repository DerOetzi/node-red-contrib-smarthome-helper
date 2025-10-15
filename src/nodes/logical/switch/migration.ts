import { EditorNodeInstance } from "node-red";
import Migration from "../../flowctrl/base/migration";
import { SwitchEditorNodeProperties } from "./types";

export default class SwitchMigration<
  T extends SwitchEditorNodeProperties = SwitchEditorNodeProperties,
> extends Migration<T> {
  protected _migrationSteps(
    node: EditorNodeInstance<T>
  ): EditorNodeInstance<T> {
    if (this.checkMigrationStepRequired(node, "0.22.2")) {
      node.targetType = "msg";
      node.migrated = true;
    }

    return super._migrationSteps(node);
  }
}
