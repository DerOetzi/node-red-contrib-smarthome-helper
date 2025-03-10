import { EditorNodeDef } from "node-red";
import StatusNode from ".";
import BaseEditorNode, { i18n, NodeEditorFormBuilder } from "../base/editor";
import { MatchJoinEditableList } from "../match-join/editor";
import { statusNodeMigration } from "./migration";
import {
  StatusEditorNodeProperties,
  StatusEditorNodePropertiesDefaults,
  StatusNodeOptionsDefaults,
  StatusNodeScope,
  StatusNodeTarget,
} from "./types";

const inputMatcherList = new MatchJoinEditableList({
  targets: Object.values(StatusNodeTarget),
  translatePrefix: "flowctrl.status",
});

const StatusEditorNode: EditorNodeDef<StatusEditorNodeProperties> = {
  category: StatusNode.NodeCategoryLabel,
  color: StatusNode.NodeColor,
  icon: "font-awesome/fa-key",
  defaults: StatusEditorNodePropertiesDefaults,
  label: function () {
    return this.name?.trim() ? this.name.trim() : i18n("flowctrl.status.name");
  },
  inputs: StatusNodeOptionsDefaults.inputs,
  outputs: StatusNodeOptionsDefaults.outputs,
  outputLabels: function (index: number) {
    const outputs = ["status", "statustext"];

    return i18n(`flowctrl.status.output.${outputs[index]}`);
  },
  oneditprepare: function () {
    statusNodeMigration.checkAndMigrate(this);
    BaseEditorNode.oneditprepare!.call(this);

    inputMatcherList.initialize("matcher-rows", this.matchers, {
      translatePrefix: "flowctrl.match-join",
    });

    const statusNodeOptionsBuilder = new NodeEditorFormBuilder(
      $("#status-node-options"),
      { translatePrefix: "flowctrl.status" }
    );

    statusNodeOptionsBuilder.createSelectInput({
      id: "node-input-scope",
      label: "scope",
      options: Object.values(StatusNodeScope),
      value: this.scope,
      icon: "sitemap",
    });

    statusNodeOptionsBuilder.createCheckboxInput({
      id: "node-input-initialActive",
      label: "initialActive",
      value: this.initialActive,
      icon: "toggle-on",
    });
  },
  oneditsave: function () {
    this.matchers = inputMatcherList.values();
  },
};

export default StatusEditorNode;
