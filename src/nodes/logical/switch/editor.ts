import { EditorNodeDef } from "node-red";
import { NodeType } from "../../../const";
import CommonNodeEditor, {
  CommonNodeEditorProperties,
} from "../../flowctrl/common/editor";

const nodeType = NodeType.LogicalSwitch;

const SwitchNodeEditor: EditorNodeDef<CommonNodeEditorProperties> = {
  ...CommonNodeEditor,
  category: nodeType.category.label,
  color: nodeType.color,
  defaults: {
    ...CommonNodeEditor.defaults,
  },
  outputs: 2,
  outputLabels: ["true", "false"],
  icon: "switch.svg",
  label: function () {
    return this.name || nodeType.name;
  },
};

export default SwitchNodeEditor;
