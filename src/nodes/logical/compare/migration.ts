import { EditorNodeInstance } from "node-red";
import { Migration } from "../../flowctrl/base/migration";
import {
  ApplicableCompareFunction,
  CompareEditorNodeProperties,
  NotApplicableCompareFunction,
} from "./types";

export class CompareMigration extends Migration<CompareEditorNodeProperties> {
  public static migrateOperationValues(
    operation: string
  ): ApplicableCompareFunction | NotApplicableCompareFunction {
    switch (operation) {
      case "neq":
        return ApplicableCompareFunction.neq;
      case "gt":
        return ApplicableCompareFunction.gt;
      case "gte":
        return ApplicableCompareFunction.gte;
      case "lt":
        return ApplicableCompareFunction.lt;
      case "lte":
        return ApplicableCompareFunction.lte;
      case "true":
      case "isTrue":
        return NotApplicableCompareFunction.isTrue;
      case "false":
      case "isFalse":
        return NotApplicableCompareFunction.isFalse;
      case "not_empty":
      case "notEmpty":
        return NotApplicableCompareFunction.notEmpty;
      case "starts_with":
      case "startsWith":
        return ApplicableCompareFunction.startsWith;
      case "ends_with":
      case "endsWith":
        return ApplicableCompareFunction.endsWith;
      case "contains":
        return ApplicableCompareFunction.contains;
      case "regex":
        return ApplicableCompareFunction.regex;
      default:
        return ApplicableCompareFunction.eq;
    }
  }

  public checkAndMigrate(
    node: EditorNodeInstance<CompareEditorNodeProperties>
  ): boolean {
    if (this.check(node, "0.21.2")) {
      node = this.migrateOperatorToOperation(node);
      node = this.migrateValueToCompare(node);
      node.migrated = true;
    }

    return this.migrate(node);
  }

  private migrateOperatorToOperation(
    node: EditorNodeInstance<CompareEditorNodeProperties>
  ): EditorNodeInstance<CompareEditorNodeProperties> {
    if (node.operator) {
      node.operation = CompareMigration.migrateOperationValues(node.operator);
      delete node.operator;
    }

    return node;
  }

  private migrateValueToCompare(
    node: EditorNodeInstance<CompareEditorNodeProperties>
  ): EditorNodeInstance<CompareEditorNodeProperties> {
    if (node.valueType) {
      node.compare = node.value!;
      node.compareType = node.valueType;

      delete node.value;
      delete node.valueType;
    }

    return node;
  }
}

export const compareMigration = new CompareMigration();
