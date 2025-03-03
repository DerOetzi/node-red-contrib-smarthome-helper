import { Migration } from "@base/migration";
import { CompareMigration } from "@logical/compare/migration";
import { EditorNodeInstance } from "node-red";
import { MatcherRow, MatchJoinEditorNodeProperties } from "./types";

export class MatchJoinMigration<
  T extends MatchJoinEditorNodeProperties = MatchJoinEditorNodeProperties,
> extends Migration<T> {
  public checkAndMigrate(node: EditorNodeInstance<T>): boolean {
    node = this.migrateMatchJoinNode(node);
    return this.migrate(node);
  }

  protected migrateMatchJoinNode(
    node: EditorNodeInstance<T>
  ): EditorNodeInstance<T> {
    if (this.check(node, "0.21.2")) {
      node = this.migrateMatchersOperation(node);
      node.migrated = true;
    }

    return node;
  }

  protected migrateMatchersOperation(
    node: EditorNodeInstance<T>
  ): EditorNodeInstance<T> {
    node.matchers = node.matchers.map((matcher: MatcherRow) => {
      if (matcher.operator) {
        matcher = {
          ...matcher,
          operation: CompareMigration.migrateOperationValues(matcher.operator),
        };
        delete matcher.operator;
      }

      return matcher;
    });

    return node;
  }
}

export const matchJoinMigration = new MatchJoinMigration();
