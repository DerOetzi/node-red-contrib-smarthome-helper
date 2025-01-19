import { EditorNodeInstance } from "node-red";
import { TimeIntervalUnit } from "../../../helpers/time.helper";
import { MatchJoinMigration } from "../../flowctrl/match-join/migration";
import { WindowReminderEditorNodeProperties } from "./types";

class WindowReminderMigration extends MatchJoinMigration<WindowReminderEditorNodeProperties> {
  public checkAndMigrate(
    node: EditorNodeInstance<WindowReminderEditorNodeProperties>
  ): boolean {
    node = this.migrateMatchJoinNode(node);

    if (this.check(node, "0.21.7")) {
      node.join = false;
      node = this.migrateInterval(node);
      node.migrated = true;
    }

    return this.migrate(node);
  }

  private migrateInterval(
    node: EditorNodeInstance<WindowReminderEditorNodeProperties>
  ): EditorNodeInstance<WindowReminderEditorNodeProperties> {
    if (!node.intervalUnit) {
      node.intervalUnit = TimeIntervalUnit.m;
    }

    return node;
  }
}

export const windowReminderMigration = new WindowReminderMigration();
