import { EditorNodeInstance } from "node-red";
import { MatchJoinMigration } from "../../../flowctrl/match-join/migration";
import { MatcherRow } from "../../../flowctrl/match-join/types";
import {
  MotionControllerEditorNodeProperties,
  MotionControllerTarget,
} from "./types";

export class MotionControllerMigration extends MatchJoinMigration<MotionControllerEditorNodeProperties> {
  public checkAndMigrate(
    node: EditorNodeInstance<MotionControllerEditorNodeProperties>
  ): boolean {
    node = this.migrateMatchJoinNode(node);

    if (this.check(node, "0.21.3")) {
      node.join = false;
      node = this.migrateMatcherTargets(node);
      node = this.migrateStatusDelay(node);
      node.migrated = true;
    }

    if (this.check(node, "0.27.1")) {
      node.outputs = 1;
      node.migrated = true;
    }

    return this.migrate(node);
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

export const motionControllerMigration = new MotionControllerMigration();
