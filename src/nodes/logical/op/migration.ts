import { EditorNodeInstance } from "node-red";
import { Migration } from "../../flowctrl/base/migration";
import { LogicalOpEditorNodeProperties, LogicalFunction } from "./types";

export class LogicalOpMigration extends Migration<LogicalOpEditorNodeProperties> {
  public checkAndMigrate(
    node: EditorNodeInstance<LogicalOpEditorNodeProperties>
  ): boolean {
    if (this.check(node, "0.21.0")) {
      node = this.migrateLogicalToOperation(node);
      node.migrated = true;
    }

    return this.migrate(node);
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

export const logicalOpMigration = new LogicalOpMigration();
