import { EditorNodeInstance } from "node-red";
import MatchJoinMigration from "../../../flowctrl/match-join/migration";
import { MatcherRow } from "../../../flowctrl/match-join/types";
import {
  MotionControllerEditorNodeProperties,
  MotionControllerTarget,
} from "./types";

export default class MotionControllerMigration extends MatchJoinMigration<MotionControllerEditorNodeProperties> {
  protected _migrationSteps(
    node: EditorNodeInstance<MotionControllerEditorNodeProperties>
  ): EditorNodeInstance<MotionControllerEditorNodeProperties> {
    if (this.checkMigrationStepRequired(node, "0.21.3")) {
      node.join = false;
      node = this.migrateMatcherTargets(node);
      node = this.migrateStatusDelay(node);
      node.migrated = true;
    }

    if (this.checkMigrationStepRequired(node, "0.27.1")) {
      node.outputs = 1;
      node.migrated = true;
    }

    return super._migrationSteps(node);
  }

  private migrateMatcherTargets(
    node: EditorNodeInstance<MotionControllerEditorNodeProperties>
  ): EditorNodeInstance<MotionControllerEditorNodeProperties> {
    node.matchers = node.matchers.map((matcher: MatcherRow) => {
      if (matcher.target === "manual_control") {
        matcher.target = MotionControllerTarget.manualControl;
      }

      return matcher;
    });

    return node;
  }

  private migrateStatusDelay(
    node: EditorNodeInstance<MotionControllerEditorNodeProperties>
  ): EditorNodeInstance<MotionControllerEditorNodeProperties> {
    if (node.statusDelay) {
      delete node.statusDelay;
    }
    return node;
  }
}
