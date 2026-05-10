import { EditorNodeInstance } from "node-red";
import ActiveControllerMigration from "../../../flowctrl/active-controller/migration";
import { WarmWaterPVControllerEditorNodeProperties } from "./types";

export default class WarmWaterPVControllerMigration extends ActiveControllerMigration<WarmWaterPVControllerEditorNodeProperties> {
  protected _migrationSteps(
    node: EditorNodeInstance<WarmWaterPVControllerEditorNodeProperties>,
  ): EditorNodeInstance<WarmWaterPVControllerEditorNodeProperties> {
    if (this.checkMigrationStepRequired(node, "1.1.1")) {
      node.debounceTopic = true;
      node.migrated = true;
    }
    return super._migrationSteps(node);
  }
}
