import BaseEditorNode, { i18n, NodeEditorFormBuilder } from "@base/editor";
import { EditorNodeDef } from "node-red";
import StatusNode from ".";
import {
  StatusEditorNodeProperties,
  StatusEditorNodePropertiesDefaults,
  StatusNodeOptionsDefaults,
} from "./types";

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
    BaseEditorNode.oneditprepare!.call(this);

    const statusNodeOptionsBuilder = new NodeEditorFormBuilder(
      $("#status-node-options"),
      { translatePrefix: "flowctrl.status" }
    );

    statusNodeOptionsBuilder.createCheckboxInput({
      id: "node-input-initialActive",
      label: "initialActive",
      value: this.initialActive,
      icon: "toggle-on",
    });
  },
};

export default StatusEditorNode;
