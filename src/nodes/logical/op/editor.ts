import { EditorNodeDef } from "node-red";
import { NodeType } from "../../../const";
import BaseNodeEditor from "../../flowctrl/base/editor";
import {
  defaultLogicalOpNodeConfig,
  LogicalOpNodeEditorProperties,
} from "./types";

const nodeType = NodeType.LogicalOp;

const LogicalOpNodeEditor: EditorNodeDef<LogicalOpNodeEditorProperties> = {
  ...BaseNodeEditor,
  category: nodeType.category.label,
  color: nodeType.color,
  defaults: {
    ...BaseNodeEditor.defaults,
    logical: { value: defaultLogicalOpNodeConfig.logical!, required: true },
    minMsgCount: {
      value: defaultLogicalOpNodeConfig.minMsgCount!,
      required: true,
    },
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
