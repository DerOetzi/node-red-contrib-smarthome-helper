import { EditorNodeDef } from "node-red";
import { NodeType } from "../../../const";
import CommonNodeEditor, {
  CommonNodeEditorProperties,
} from "../../flowctrl/common/editor";

interface LogicalOpProperties extends CommonNodeEditorProperties {
  logical: string;
  minMsgCount: number;
}

const nodeType = NodeType.LogicalOp;

const LogicalOpNodeEditor: EditorNodeDef<LogicalOpProperties> = {
  ...CommonNodeEditor,
  category: nodeType.category.label,
  color: nodeType.color,
  defaults: {
    ...CommonNodeEditor.defaults,
    logical: { value: "and" },
    minMsgCount: { value: 1 },
  },
  outputLabels: ["Logical operation result"],
  label: function () {
    const logicalOp = this.logical.toUpperCase();
    let label: string = logicalOp;

    if (this.name) {
      label = `${this.name} (${logicalOp})`;
    }

    return label;
  },
  icon: "logical.svg",
};

export default LogicalOpNodeEditor;
