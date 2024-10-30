import { EditorNodeDef } from "node-red";
import { NodeType } from "../../../const";
import BaseNodeEditor from "../../flowctrl/base/editor";
import { SwitchNodeEditorProperties } from "./types";

const nodeType = NodeType.LogicalSwitch;

const SwitchNodeEditor: EditorNodeDef<SwitchNodeEditorProperties> = {
  ...BaseNodeEditor,
  category: nodeType.category.label,
  color: nodeType.color,
  defaults: {
    ...BaseNodeEditor.defaults,
  },
  outputs: 2,
  outputLabels: ["true", "false"],
  icon: "switch.svg",
  label: function () {
    return this.name || nodeType.name;
  },
};

export default SwitchNodeEditor;
