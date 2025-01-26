import { EditorNodeInstance } from "node-red";
import { MatchJoinMigration } from "../../../flowctrl/match-join/migration";
import { LightControllerEditorNodeProperties } from "./types";

export class LightControllerMigration extends MatchJoinMigration<LightControllerEditorNodeProperties> {
  public checkAndMigrate(
    node: EditorNodeInstance<LightControllerEditorNodeProperties>
  ): boolean {
    node = this.migrateMatchJoinNode(node);

    if (this.check(node, "0.21.3")) {
      node.join = false;
      node.migrated = true;
    }

    return this.migrate(node);
  }
}

export const lightControllerMigration = new LightControllerMigration();
