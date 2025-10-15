import { EditorNodeDef } from "node-red";
import { createEditorDefaults, i18n } from "../../flowctrl/base/editor";
import SwitchNodeEditor from "../switch/editor";
import ToggleNode from "./";
import {
  ToggleEditorNodeProperties,
  ToggleNodeOptions,
  ToggleNodeOptionsDefaults,
} from "./types";

const ToggleEditorNode: EditorNodeDef<ToggleEditorNodeProperties> = {
  category: ToggleNode.NodeCategoryLabel,
  color: ToggleNode.NodeColor,
  icon: "font-awesome/fa-exchange",
  defaults: createEditorDefaults<ToggleNodeOptions, ToggleEditorNodeProperties>(
    ToggleNodeOptionsDefaults
  ),
  label: function () {
    return this.name?.trim() ? this.name.trim() : i18n("logical.toggle.name");
  },
  inputs: ToggleNodeOptionsDefaults.inputs,
  outputs: ToggleNodeOptionsDefaults.outputs,
  outputLabels: function (index) {
    if (typeof SwitchNodeEditor.outputLabels === "function") {
      return SwitchNodeEditor.outputLabels.call(this, index);
    }
    return undefined;
  },
  oneditprepare: function () {
    SwitchNodeEditor.oneditprepare!.call(this);
  },
};

export default ToggleEditorNode;
