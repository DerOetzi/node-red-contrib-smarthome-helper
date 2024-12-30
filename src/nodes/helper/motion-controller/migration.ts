import { EditorNodeInstance } from "node-red";
import { TimeIntervalUnit } from "../../../helpers/time.helper";
import { MatchJoinMigration } from "../../flowctrl/match-join/migration";
import { MatcherRow } from "../../flowctrl/match-join/types";
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
      node.initializeDelay = node.statusDelay;
      node.initializeDelayUnit = TimeIntervalUnit.ms;

      delete node.statusDelay;
    }
    return node;
  }
}

export const motionControllerMigration = new MotionControllerMigration();
