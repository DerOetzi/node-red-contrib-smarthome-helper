import { EditorNodeInstance } from "node-red";
import MatchJoinMigration from "../../flowctrl/match-join/migration";
import { MatcherRowDefaults } from "../../flowctrl/match-join/types";
import { StatusEditorNodeProperties, StatusNodeScope } from "./types";
import { ActiveControllerTarget } from "../active-controller/types";

export default class StatusNodeMigration extends MatchJoinMigration<StatusEditorNodeProperties> {
  protected _migrationSteps(
    node: EditorNodeInstance<StatusEditorNodeProperties>,
  ): EditorNodeInstance<StatusEditorNodeProperties> {
    if (this.checkMigrationStepRequired(node, "0.28.0")) {
      node.join = false;
      node.matchers = [
        {
          ...MatcherRowDefaults,
          target: ActiveControllerTarget.activeCondition,
          targetType: "str",
        },
      ];
      node.scope = StatusNodeScope.global;
      node.migrated = true;
    }

    if (this.checkMigrationStepRequired(node, "1.1.0")) {
      node.defaultActive = node.initialActive ?? false;
      delete node.initialActive;
      node.migrated = true;
    }

    return super._migrationSteps(node);
  }
}
