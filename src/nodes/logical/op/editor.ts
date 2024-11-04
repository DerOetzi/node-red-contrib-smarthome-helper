import { EditorNodeDef } from "node-red";
import BaseNodeEditor from "../../flowctrl/base/editor";
import {
  defaultLogicalOpNodeConfig,
  LogicalOpNodeEditorProperties,
  LogicalOpNodeType,
} from "./types";

const LogicalOpNodeEditor: EditorNodeDef<LogicalOpNodeEditorProperties> = {
  ...BaseNodeEditor,
  category: LogicalOpNodeType.categoryLabel,
  color: LogicalOpNodeType.color,
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

export { LogicalOpNodeType };
