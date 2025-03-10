import { EditorNodeInstance } from "node-red";
import { Migration } from "../../flowctrl/base/migration";
import { SwitchEditorNodeProperties } from "./types";

export class SwitchMigration<
  T extends SwitchEditorNodeProperties = SwitchEditorNodeProperties,
> extends Migration<T> {
  public checkAndMigrate(node: EditorNodeInstance<T>): boolean {
    node = this.migrateSwitchNode(node);
    return this.migrate(node);
  }

  protected migrateSwitchNode(
    node: EditorNodeInstance<T>
  ): EditorNodeInstance<T> {
    if (this.check(node, "0.22.2")) {
      node.targetType = "msg";
      node.migrated = true;
    }

    return node;
  }
}

export const switchMigration = new SwitchMigration();
