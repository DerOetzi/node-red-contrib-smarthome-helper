import { EditorNodeInstance } from "node-red";
import { MatcherRow } from "../../../flowctrl/match-join/types";
import {
  HeatingControllerEditorNodeProperties,
  HeatingControllerTarget,
} from "./types";
import { ActiveControllerTarget } from "../../../flowctrl/active-controller/types";
import ActiveControllerMigration from "../../../flowctrl/active-controller/migration";

export default class HeatingControllerMigration extends ActiveControllerMigration<HeatingControllerEditorNodeProperties> {
  protected _migrationSteps(
    node: EditorNodeInstance<HeatingControllerEditorNodeProperties>,
  ): EditorNodeInstance<HeatingControllerEditorNodeProperties> {
    if (this.checkMigrationStepRequired(node, "0.21.4")) {
      node.join = false;
      node = this.migrateMatcherTargets(node);
      node = this.migrateStatusDelay(node);
      node.migrated = true;
    }

    if (this.checkMigrationStepRequired(node, "0.25.0")) {
      node.defaultActive = false;
      node.reactivateEnabled = true;
      node.migrated = true;
    }

    if (this.checkMigrationStepRequired(node, "0.26.0")) {
      node.boostEnabled = true;
      node.pvBoostEnabled = false;
      node.pvBoostTemperatureOffset = 1;
      node.migrated = true;
    }

    if (this.checkMigrationStepRequired(node, "0.27.1")) {
      node.outputs = 3;
      node.migrated = true;
    }

    if (this.checkMigrationStepRequired(node, "1.0.3")) {
      node.defaultComfort = node.defaultActive;
      node.defaultActive = true;
      for (const matcher of node.matchers) {
        if (matcher.target === ActiveControllerTarget.activeCondition) {
          matcher.target = HeatingControllerTarget.comfortCondition;
        }
      }

      node.migrated = true;
    }

    return super._migrationSteps(node);
  }

  private migrateMatcherTargets(
    node: EditorNodeInstance<HeatingControllerEditorNodeProperties>,
  ): EditorNodeInstance<HeatingControllerEditorNodeProperties> {
    node.matchers = node.matchers.map((matcher: MatcherRow) => {
      if (matcher.target === "manual_control") {
        matcher.target = ActiveControllerTarget.manualControl;
      }

      return matcher;
    });

    return node;
  }

  private migrateStatusDelay(
    node: EditorNodeInstance<HeatingControllerEditorNodeProperties>,
  ): EditorNodeInstance<HeatingControllerEditorNodeProperties> {
    if (node.statusDelay) {
      delete node.statusDelay;
    }
    return node;
  }
}
