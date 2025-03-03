import { MatchJoinMigration } from "@match-join/migration";
import { EditorNodeInstance } from "node-red";
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

    if (this.check(node, "0.25.3")) {
      node.colorTemperature =
        Math.round(1000000 / node.colorTemperature / 50) * 50;
      node.migrated = true;
    }

    return this.migrate(node);
  }
}

export const lightControllerMigration = new LightControllerMigration();
