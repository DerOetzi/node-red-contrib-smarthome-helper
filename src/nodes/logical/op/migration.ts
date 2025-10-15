import { EditorNodeInstance } from "node-red";
import SwitchMigration from "../switch/migration";
import { LogicalFunction, LogicalOpEditorNodeProperties } from "./types";

export default class LogicalOpMigration extends SwitchMigration<LogicalOpEditorNodeProperties> {
  protected _migrationSteps(
    node: EditorNodeInstance<LogicalOpEditorNodeProperties>
  ): EditorNodeInstance<LogicalOpEditorNodeProperties> {
    if (this.checkMigrationStepRequired(node, "0.21.0")) {
      node = this.migrateLogicalToOperation(node);
      node.migrated = true;
    }

    return super._migrationSteps(node);
  }

  private migrateLogicalToOperation(
    node: EditorNodeInstance<LogicalOpEditorNodeProperties>
  ): EditorNodeInstance<LogicalOpEditorNodeProperties> {
    if (node.logical) {
      node.operation = node.logical as LogicalFunction;
      delete node.logical;
    }

    return node;
  }
}
