import { MatchJoinMigration } from "@match-join/migration";
import { EditorNodeInstance } from "node-red";
import {
  WhitegoodReminderEditorNodeProperties,
  WhitegoodReminderNodeOptionsDefaults,
} from "./types";

class WhitegoodReminderMigration extends MatchJoinMigration<WhitegoodReminderEditorNodeProperties> {
  public checkAndMigrate(
    node: EditorNodeInstance<WhitegoodReminderEditorNodeProperties>
  ): boolean {
    node = this.migrateMatchJoinNode(node);

    if (this.check(node, "0.23.3")) {
      node = this.migrateRunOutputs(node);
      node.migrated = true;
    }

    if (this.check(node, "0.25.3")) {
      node.statusShowRuns = WhitegoodReminderNodeOptionsDefaults.statusShowRuns;
      node.migrated = true;
    }

    return this.migrate(node);
  }

  private migrateRunOutputs(
    node: EditorNodeInstance<WhitegoodReminderEditorNodeProperties>
  ): EditorNodeInstance<WhitegoodReminderEditorNodeProperties> {
    node.outputs = node.cleanupEnabled ? 2 : 1;
    return node;
  }
}

export const whitegoodReminderMigration = new WhitegoodReminderMigration();
