import { EditorNodeInstance } from "node-red";
import { MatchJoinMigration } from "../../flowctrl/match-join/migration";
import { MatcherRowDefaults } from "../../flowctrl/match-join/types";
import {
  StatusEditorNodeProperties,
  StatusNodeScope,
  StatusNodeTarget,
} from "./types";

class StatusNodeMigration extends MatchJoinMigration<StatusEditorNodeProperties> {
  public checkAndMigrate(
    node: EditorNodeInstance<StatusEditorNodeProperties>
  ): boolean {
    node = this.migrateMatchJoinNode(node);

    if (this.check(node, "0.28.0")) {
      node.join = false;
      node.matchers = [
        {
          ...MatcherRowDefaults,
          target: StatusNodeTarget.activeCondition,
          targetType: "str",
        },
      ];
      node.scope = StatusNodeScope.global;
      node.migrated = true;
    }

    return this.migrate(node);
  }
}

export const statusNodeMigration = new StatusNodeMigration();
