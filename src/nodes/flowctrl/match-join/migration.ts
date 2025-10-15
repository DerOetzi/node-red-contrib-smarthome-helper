import { EditorNodeInstance } from "node-red";
import CompareMigration from "../../logical/compare/migration";
import Migration from "../base/migration";
import { MatcherRow, MatchJoinEditorNodeProperties } from "./types";

export default class MatchJoinMigration<
  T extends MatchJoinEditorNodeProperties = MatchJoinEditorNodeProperties,
> extends Migration<T> {
  protected _migrationSteps(
    node: EditorNodeInstance<T>
  ): EditorNodeInstance<T> {
    if (this.checkMigrationStepRequired(node, "0.21.2")) {
      node = this.migrateMatchersOperation(node);
      node.migrated = true;
    }

    return super._migrationSteps(node);
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
