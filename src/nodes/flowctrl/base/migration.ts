import type { EditorNodeInstance, EditorRED } from "node-red";
import version from "../../../version";
import { BaseEditorNodeProperties } from "./types";

declare const RED: EditorRED;

export class Migration<
  T extends BaseEditorNodeProperties = BaseEditorNodeProperties,
> {
  public checkAndMigrate(node: EditorNodeInstance<T>): boolean {
    if (this.check(node, "0.21.0")) {
      //force to set any version
      node.migrated = true;
    }

    return this.migrate(node);
  }

  protected check(
    node: EditorNodeInstance<T>,
    compareVersion: string
  ): boolean {
    if (!node.version) {
      return true;
    }

    const nodeVersionParts = node.version.split(".").map(Number);
    const compareVersionParts = compareVersion.split(".").map(Number);

    for (let i = 0; i < compareVersionParts.length; i++) {
      if (nodeVersionParts[i] < compareVersionParts[i]) {
        return true;
      } else if (nodeVersionParts[i] > compareVersionParts[i]) {
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

export const baseMigration = new Migration();
