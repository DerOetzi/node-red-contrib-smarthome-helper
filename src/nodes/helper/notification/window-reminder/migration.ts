import { TimeIntervalUnit } from "../../../../helpers/time.helper";
import MatchJoinMigration from "../../../flowctrl/match-join/migration";
import { EditorNodeInstance } from "node-red";
import { WindowReminderEditorNodeProperties } from "./types";

export default class WindowReminderMigration extends MatchJoinMigration<WindowReminderEditorNodeProperties> {
  protected _migrationSteps(
    node: EditorNodeInstance<WindowReminderEditorNodeProperties>
  ): EditorNodeInstance<WindowReminderEditorNodeProperties> {
    if (this.checkMigrationStepRequired(node, "0.21.7")) {
      node.join = false;
      node = this.migrateInterval(node);
      node.migrated = true;
    }

    if (this.checkMigrationStepRequired(node, "0.34.0")) {
      node.interval2 = 0;
      node.intervalUnit2 = TimeIntervalUnit.m;
      node.migrated = true;
    }

    if (this.checkMigrationStepRequired(node, "0.37.0")) {
      node.intervals = [];
      if (node.interval) {
        node.intervals.push({
          interval: node.interval,
          intervalUnit: node.intervalUnit ?? TimeIntervalUnit.m,
        });
      }

      if (node.interval2) {
        node.intervals.push({
          interval: node.interval2,
          intervalUnit: node.intervalUnit2 ?? TimeIntervalUnit.m,
        });
      }
      node.migrated = true;
    }

    return super._migrationSteps(node);
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
