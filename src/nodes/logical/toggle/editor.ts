import { i18n } from "@base/editor";
import SwitchNodeEditor from "@logical/switch/editor";
import { SwitchNodeOptionsDefaults } from "@logical/switch/types";
import { EditorNodeDef } from "node-red";
import ToggleNode from "./";
import {
  ToggleEditorNodeProperties,
  ToggleEditorNodePropertiesDefaults,
} from "./types";

const ToggleEditorNode: EditorNodeDef<ToggleEditorNodeProperties> = {
  category: ToggleNode.NodeCategoryLabel,
  color: ToggleNode.NodeColor,
  icon: "font-awesome/fa-exchange",
  defaults: ToggleEditorNodePropertiesDefaults,
  label: function () {
    return this.name?.trim() ? this.name.trim() : i18n("logical.toggle.name");
  },
  inputs: SwitchNodeOptionsDefaults.inputs,
  outputs: SwitchNodeOptionsDefaults.outputs,
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
