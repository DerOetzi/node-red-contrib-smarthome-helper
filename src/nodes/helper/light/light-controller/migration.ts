import { EditorNodeInstance } from "node-red";
import MatchJoinMigration from "../../../flowctrl/match-join/migration";
import { LightControllerEditorNodeProperties } from "./types";

export default class LightControllerMigration extends MatchJoinMigration<LightControllerEditorNodeProperties> {
  protected _migrationSteps(
    node: EditorNodeInstance<LightControllerEditorNodeProperties>
  ): EditorNodeInstance<LightControllerEditorNodeProperties> {
    if (this.checkMigrationStepRequired(node, "0.21.3")) {
      node.join = false;
      node.migrated = true;
    }

    if (this.checkMigrationStepRequired(node, "0.25.3")) {
      node.colorTemperature =
        Math.round(1000000 / node.colorTemperature / 50) * 50;
      node.migrated = true;
    }

    return super._migrationSteps(node);
  }
}
