import { EditorNodeInstance } from "node-red";
import { SwitchMigration } from "../switch/migration";
import { LogicalFunction, LogicalOpEditorNodeProperties } from "./types";

export class LogicalOpMigration extends SwitchMigration<LogicalOpEditorNodeProperties> {
  public checkAndMigrate(
    node: EditorNodeInstance<LogicalOpEditorNodeProperties>
  ): boolean {
    node = this.migrateSwitchNode(node);

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
