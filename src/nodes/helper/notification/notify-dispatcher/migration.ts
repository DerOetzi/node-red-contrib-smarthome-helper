import { EditorNodeInstance } from "node-red";
import MatchJoinMigration from "../../../flowctrl/match-join/migration";
import { MatcherRowDefaults } from "../../../flowctrl/match-join/types";
import { NotApplicableCompareFunction } from "../../../logical/compare/types";
import {
  NotifyDispatcherEditorNodeProperties,
  NotifyDispatcherTarget,
} from "./types";

export default class NotifyDispatcherMigration extends MatchJoinMigration<NotifyDispatcherEditorNodeProperties> {
  protected _migrationSteps(
    node: EditorNodeInstance<NotifyDispatcherEditorNodeProperties>
  ): EditorNodeInstance<NotifyDispatcherEditorNodeProperties> {
    if (this.checkMigrationStepRequired(node, "0.21.5")) {
      node.join = false;
      node = this.migratePersonCount(node);
      node = this.addMessageProperty(node);

      node.migrated = true;
    }

    return super._migrationSteps(node);
  }

  private migratePersonCount(
    node: EditorNodeInstance<NotifyDispatcherEditorNodeProperties>
  ): EditorNodeInstance<NotifyDispatcherEditorNodeProperties> {
    const personCounts = node.matchers
      .filter((matcher) => matcher.target.startsWith("person"))
      .map((matcher) => parseInt(matcher.target.replace("person", ""), 10))
      .filter((count) => !isNaN(count));

    if (personCounts.length > 0) {
      node.persons = Math.max(...personCounts);
    }
    return node;
  }

  private addMessageProperty(
    node: EditorNodeInstance<NotifyDispatcherEditorNodeProperties>
  ): EditorNodeInstance<NotifyDispatcherEditorNodeProperties> {
    node.matchers.push({
      ...MatcherRowDefaults,
      property: "notify",
      propertyType: "msg",
      operation: NotApplicableCompareFunction.notEmpty,
      target: NotifyDispatcherTarget.message,
      targetType: "str",
    });

    return node;
  }
}
