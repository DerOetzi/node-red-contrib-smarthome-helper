import type { EditorNodeInstance, EditorRED } from "node-red";
import version from "../../../version";
import { BaseEditorNodeProperties } from "./types";
import { cloneDeep } from "../../../helpers/object.helper";

declare const RED: EditorRED;

const INITIAL_VERSION = "0.21.0";
const REMOVE_DELAY_VERSION = "0.27.0";

export default class Migration<
  T extends BaseEditorNodeProperties = BaseEditorNodeProperties,
> {
  public check(
    node: EditorNodeInstance<T>,
    forceNewestVersion: boolean = false
  ): boolean {
    node.migrated = false;

    const nodeSnapshot = cloneDeep<EditorNodeInstance<T>>(node);

    this._migrationSteps(nodeSnapshot);

    if (
      forceNewestVersion &&
      this.checkMigrationStepRequired(nodeSnapshot, version)
    ) {
      nodeSnapshot.migrated = true;
    }

    return nodeSnapshot.migrated;
  }

  public checkAndMigrate(
    node: EditorNodeInstance<T>,
    forceNewestVersion: boolean = false
  ): boolean {
    node.migrated = false;

    this._migrationSteps(node);

    if (forceNewestVersion && this.checkMigrationStepRequired(node, version)) {
      node.migrated = true;
    }

    return this.migrate(node);
  }

  protected _migrationSteps(
    node: EditorNodeInstance<T>
  ): EditorNodeInstance<T> {
    if (this.checkMigrationStepRequired(node, INITIAL_VERSION)) {
      node.migrated = true;
    }

    if (this.checkMigrationStepRequired(node, REMOVE_DELAY_VERSION)) {
      delete node.initializeDelay;
      delete node.initializeDelayUnit;
      node.migrated = true;
    }

    return node;
  }

  protected checkMigrationStepRequired(
    node: EditorNodeInstance<T>,
    compareVersion: string
  ): boolean {
    if (!node.version) {
      return true;
    }

    const versionAParts = node.version.split(".").map(Number);
    const versionBParts = compareVersion.split(".").map(Number);

    for (let i = 0; i < versionAParts.length; i++) {
      if (versionAParts[i] < versionBParts[i]) {
        return true;
      } else if (versionAParts[i] > versionBParts[i]) {
        return false;
      }
    }

    return false;
  }

  protected migrate(node: EditorNodeInstance<T>): boolean {
    if (node.migrated) {
      node = this.migrateVersion(node);
      (node as any).changed = true;
      RED.editor.updateNodeProperties(node);

      const nodeIdentifier = node.name ?? node.type;
      RED.notify(`Node ${nodeIdentifier} migrated to version ${version}`);
      RED.nodes.dirty(true);
    }

    return node.migrated;
  }

  private migrateVersion(node: EditorNodeInstance<T>): EditorNodeInstance<T> {
    node.version = version;
    return node;
  }
}
