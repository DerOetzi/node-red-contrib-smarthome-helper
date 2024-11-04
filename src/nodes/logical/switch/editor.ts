import { EditorNodeDef } from "node-red";
import BaseNodeEditor from "../../flowctrl/base/editor";
import { NodeColor } from "../../types";
import { logicalCategory } from "../types";
import { SwitchNodeEditorProperties, SwitchNodeType } from "./types";

const SwitchNodeEditor: EditorNodeDef<SwitchNodeEditorProperties> = {
  ...BaseNodeEditor,
  category: SwitchNodeType.categoryLabel,
  color: SwitchNodeType.color,
  defaults: {
    ...BaseNodeEditor.defaults,
  },
  outputs: 2,
  outputLabels: ["true", "false"],
  icon: "switch.svg",
  label: function () {
    return this.name || "switch";
  },
};

export default SwitchNodeEditor;

export { SwitchNodeType };
