import { EditorNodeInstance } from "node-red";
import MatchJoinMigration from "../../flowctrl/match-join/migration";
import { MatcherRowDefaults } from "../../flowctrl/match-join/types";
import {
  StatusEditorNodeProperties,
  StatusNodeScope,
  StatusNodeTarget,
} from "./types";

export default class StatusNodeMigration extends MatchJoinMigration<StatusEditorNodeProperties> {
  protected _migrationSteps(
    node: EditorNodeInstance<StatusEditorNodeProperties>
  ): EditorNodeInstance<StatusEditorNodeProperties> {
    if (this.checkMigrationStepRequired(node, "0.28.0")) {
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

    return super._migrationSteps(node);
  }
}
