import { EditorNodeInstance } from "node-red";
import { MatchJoinMigration } from "../../../flowctrl/match-join/migration";
import { MatcherRow } from "../../../flowctrl/match-join/types";
import {
  HeatingControllerEditorNodeProperties,
  HeatingControllerTarget,
} from "./types";

class HeatingControllerMigration extends MatchJoinMigration<HeatingControllerEditorNodeProperties> {
  public checkAndMigrate(
    node: EditorNodeInstance<HeatingControllerEditorNodeProperties>
  ): boolean {
    node = this.migrateMatchJoinNode(node);

    if (this.check(node, "0.21.4")) {
      node.join = false;
      node = this.migrateMatcherTargets(node);
      node = this.migrateStatusDelay(node);
      node.migrated = true;
    }

    if (this.check(node, "0.25.0")) {
      node.defaultActive = false;
      node.reactivateEnabled = true;
      node.migrated = true;
    }

    if (this.check(node, "0.26.0")) {
      node.boostEnabled = true;
      node.pvBoostEnabled = false;
      node.pvBoostTemperatureOffset = 1;
      node.migrated = true;
    }

    if (this.check(node, "0.27.1")) {
      node.outputs = 3;
      node.migrated = true;
    }

    return this.migrate(node);
  }

  private migrateMatcherTargets(
    node: EditorNodeInstance<HeatingControllerEditorNodeProperties>
  ): EditorNodeInstance<HeatingControllerEditorNodeProperties> {
    node.matchers = node.matchers.map((matcher: MatcherRow) => {
      if (matcher.target === "manual_control") {
        matcher.target = HeatingControllerTarget.manualControl;
      }

      return matcher;
    });

    return node;
  }

  private migrateStatusDelay(
    node: EditorNodeInstance<HeatingControllerEditorNodeProperties>
  ): EditorNodeInstance<HeatingControllerEditorNodeProperties> {
    if (node.statusDelay) {
      delete node.statusDelay;
    }
    return node;
  }
}

export const heatingControllerMigration = new HeatingControllerMigration();
