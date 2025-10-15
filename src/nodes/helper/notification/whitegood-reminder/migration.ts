import { EditorNodeInstance } from "node-red";
import MatchJoinMigration from "../../../flowctrl/match-join/migration";
import {
  WhitegoodReminderEditorNodeProperties,
  WhitegoodReminderNodeOptionsDefaults,
} from "./types";

export default class WhitegoodReminderMigration extends MatchJoinMigration<WhitegoodReminderEditorNodeProperties> {
  protected _migrationSteps(
    node: EditorNodeInstance<WhitegoodReminderEditorNodeProperties>
  ): EditorNodeInstance<WhitegoodReminderEditorNodeProperties> {
    if (this.checkMigrationStepRequired(node, "0.23.3")) {
      node = this.migrateRunOutputs(node);
      node.migrated = true;
    }

    if (this.checkMigrationStepRequired(node, "0.25.3")) {
      node.statusShowRuns = WhitegoodReminderNodeOptionsDefaults.statusShowRuns;
      node.migrated = true;
    }

    return super._migrationSteps(node);
  }

  private migrateRunOutputs(
    node: EditorNodeInstance<WhitegoodReminderEditorNodeProperties>
  ): EditorNodeInstance<WhitegoodReminderEditorNodeProperties> {
    node.outputs = node.cleanupEnabled ? 2 : 1;
    return node;
  }
}
