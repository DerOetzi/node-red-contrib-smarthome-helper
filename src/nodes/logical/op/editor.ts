import { EditorNodeDef } from "node-red";
import { NodeType } from "../../../const";
import {
  BaseNodeEditorProperties,
  baseNodeEditorPropertiesDefaults,
} from "../../../editor/types";

interface LogicalOpProperties extends BaseNodeEditorProperties {
  logical: string;
  minMsgCount: number;
}

const nodeType = NodeType.LogicalOp;

const LogicalOpNodeEditor: EditorNodeDef<LogicalOpProperties> = {
  category: nodeType.category.label,
  color: nodeType.color,
  defaults: {
    logical: { value: "and" },
    minMsgCount: { value: 1 },
    ...baseNodeEditorPropertiesDefaults,
  },
  inputs: 1,
  outputs: 1,
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
  oneditprepare: function () {
    $("#node-input-topic").typedInput({
      types: ["msg", "str"],
      typeField: "#node-input-topicType",
    });
  },
};

export default LogicalOpNodeEditor;
