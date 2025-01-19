import { EditorNodeInstance } from "node-red";
import { TimeIntervalUnit } from "../../../helpers/time.helper";
import { MatchJoinMigration } from "../../flowctrl/match-join/migration";
import { MatcherRow } from "../../flowctrl/match-join/types";
import {
  HeatingControllerEditorNodeProperties,
  HeatingControllerTarget,
} from "./types";

export class HeatingControllerMigration extends MatchJoinMigration<HeatingControllerEditorNodeProperties> {
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
      node.initializeDelay = node.statusDelay;
      node.initializeDelayUnit = TimeIntervalUnit.ms;

      delete node.statusDelay;
    }
    return node;
  }
}

export const heatingControllerMigration = new HeatingControllerMigration();
