import { EditorNodeDef } from "node-red";
import SwitchNodeEditor from "../switch/editor";
import {
  defaultToggleNodeConfig,
  ToggleNodeEditorProperties,
  ToggleNodeType,
} from "./types";

const ToggleNodeEditor: EditorNodeDef<ToggleNodeEditorProperties> = {
  ...SwitchNodeEditor,
  defaults: {
    ...SwitchNodeEditor.defaults,
    target: { value: defaultToggleNodeConfig.target!, required: true },
    trueValue: { value: defaultToggleNodeConfig.trueValue!, required: true },
    trueType: { value: defaultToggleNodeConfig.trueType!, required: true },
    falseValue: { value: defaultToggleNodeConfig.falseValue!, required: true },
    falseType: { value: defaultToggleNodeConfig.falseType!, required: true },
    seperatedOutputs: {
      value: defaultToggleNodeConfig.seperatedOutputs!,
      required: false,
    },
    outputs: { value: defaultToggleNodeConfig.outputs!, required: true },
  },
  label: function () {
    return this.name || ToggleNodeType.name;
  },
  outputLabels: function (index) {
    if (this.seperatedOutputs) {
      return index === 0 ? "true" : "false";
    } else if (index === 0) {
      return "toggle";
    }
  },
  icon: "switch.svg",
  oneditprepare: function () {
    SwitchNodeEditor.oneditprepare!.call(this);
  },
};

export default ToggleNodeEditor;
