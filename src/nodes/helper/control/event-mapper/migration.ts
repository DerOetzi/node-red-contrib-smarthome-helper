import { MatchJoinMigration } from "@match-join/migration";
import { EditorNodeInstance } from "node-red";
import { EventMapperEditorNodeProperties } from "./types";

export class EventMapperMigration extends MatchJoinMigration<EventMapperEditorNodeProperties> {
  public checkAndMigrate(
    node: EditorNodeInstance<EventMapperEditorNodeProperties>
  ): boolean {
    node = this.migrateMatchJoinNode(node);

    if (this.check(node, "0.21.1")) {
      node.join = false;
      node.migrated = true;
    }

    return this.migrate(node);
  }
}

export const eventMapperMigration = new EventMapperMigration();
