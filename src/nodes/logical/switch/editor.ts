import { EditorNodeDef } from "node-red";
import { NodeType } from "../../../const";
import BaseNodeEditor, {
  BaseNodeEditorProperties,
} from "../../flowctrl/base/editor";

const nodeType = NodeType.LogicalSwitch;

const SwitchNodeEditor: EditorNodeDef<BaseNodeEditorProperties> = {
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
