import { EditorNodeInstance } from "node-red";
import MatchJoinMigration from "../../../flowctrl/match-join/migration";
import { EventMapperEditorNodeProperties } from "./types";

export default class EventMapperMigration extends MatchJoinMigration<EventMapperEditorNodeProperties> {
  protected _migrationSteps(
    node: EditorNodeInstance<EventMapperEditorNodeProperties>
  ): EditorNodeInstance<EventMapperEditorNodeProperties> {
    if (this.checkMigrationStepRequired(node, "0.21.1")) {
      node.join = false;
      node.migrated = true;
    }

    return super._migrationSteps(node);
  }
}
