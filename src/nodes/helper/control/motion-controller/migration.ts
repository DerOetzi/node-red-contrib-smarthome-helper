import { EditorNodeInstance } from "node-red";
import MatchJoinMigration from "../../../flowctrl/match-join/migration";
import { MatcherRow } from "../../../flowctrl/match-join/types";
import { MotionControllerEditorNodeProperties } from "./types";
import {
  ActiveControllerNodeOptionsDefaults,
  ActiveControllerTarget,
} from "../../../flowctrl/active-controller/types";

export default class MotionControllerMigration extends MatchJoinMigration<MotionControllerEditorNodeProperties> {
  protected _migrationSteps(
    node: EditorNodeInstance<MotionControllerEditorNodeProperties>,
  ): EditorNodeInstance<MotionControllerEditorNodeProperties> {
    node = this.applyStep(node, this.step0_21_3, "0.21.3");
    node = this.applyStep(node, this.step0_27_1, "0.27.1");
    node = this.applyStep(node, this.step1_2_24, "1.2.24");

    return super._migrationSteps(node);
  }

  private step0_21_3(
    node: EditorNodeInstance<MotionControllerEditorNodeProperties>,
  ) {
    node.join = false;
    node = this.migrateMatcherTargets(node);
    node = this.migrateStatusDelay(node);
    return node;
  }

  private migrateMatcherTargets(
    node: EditorNodeInstance<MotionControllerEditorNodeProperties>,
  ): EditorNodeInstance<MotionControllerEditorNodeProperties> {
    node.matchers = node.matchers.map((matcher: MatcherRow) => {
      if (matcher.target === "manual_control") {
        matcher.target = ActiveControllerTarget.manualControl;
      }

      return matcher;
    });

    return node;
  }

  private migrateStatusDelay(
    node: EditorNodeInstance<MotionControllerEditorNodeProperties>,
  ): EditorNodeInstance<MotionControllerEditorNodeProperties> {
    if (node.statusDelay) {
      delete node.statusDelay;
    }
    return node;
  }

  private step0_27_1(
    node: EditorNodeInstance<MotionControllerEditorNodeProperties>,
  ) {
    node.outputs = 1;
    return node;
  }

  private step1_2_24(
    node: EditorNodeInstance<MotionControllerEditorNodeProperties>,
  ) {
    node.defaultActive = ActiveControllerNodeOptionsDefaults.defaultActive;
    node.reactivateEnabled = false;
    node.pause = ActiveControllerNodeOptionsDefaults.pause;
    node.pauseUnit = ActiveControllerNodeOptionsDefaults.pauseUnit;
    return node;
  }
}
