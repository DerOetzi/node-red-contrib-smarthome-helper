import { EditorNodeDef } from "node-red";
import SwitchNodeEditor from "../switch/editor";
import {
  defaultLogicalOpNodeConfig,
  LogicalOpNodeEditorProperties,
  LogicalOpNodeType,
} from "./types";

const LogicalOpNodeEditor: EditorNodeDef<LogicalOpNodeEditorProperties> = {
  ...SwitchNodeEditor,
  category: LogicalOpNodeType.categoryLabel,
  color: LogicalOpNodeType.color,
  defaults: {
    ...SwitchNodeEditor.defaults,
    logical: { value: defaultLogicalOpNodeConfig.logical!, required: true },
    minMsgCount: {
      value: defaultLogicalOpNodeConfig.minMsgCount!,
      required: true,
    },
    target: { value: defaultLogicalOpNodeConfig.target!, required: true },
    trueValue: { value: defaultLogicalOpNodeConfig.trueValue!, required: true },
    trueType: { value: defaultLogicalOpNodeConfig.trueType!, required: true },
    falseValue: {
      value: defaultLogicalOpNodeConfig.falseValue!,
      required: true,
    },
    falseType: { value: defaultLogicalOpNodeConfig.falseType!, required: true },
    seperatedOutputs: {
      value: defaultLogicalOpNodeConfig.seperatedOutputs!,
      required: false,
    },
    outputs: { value: defaultLogicalOpNodeConfig.outputs!, required: true },
  },
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
    SwitchNodeEditor.oneditprepare!.call(this);
  },
};

export default LogicalOpNodeEditor;

export { LogicalOpNodeType };
