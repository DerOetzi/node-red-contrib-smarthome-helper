import { EditorNodeDef } from "node-red";
import BaseNodeEditor from "../../flowctrl/base/editor";
import {
  defaultSwitchNodeConfig,
  SwitchNodeEditorProperties,
  SwitchNodeType,
} from "./types";

const SwitchNodeEditor: EditorNodeDef<SwitchNodeEditorProperties> = {
  ...BaseNodeEditor,
  category: SwitchNodeType.categoryLabel,
  color: SwitchNodeType.color,
  defaults: {
    ...BaseNodeEditor.defaults,
    target: { value: defaultSwitchNodeConfig.target!, required: true },
    trueValue: { value: defaultSwitchNodeConfig.trueValue!, required: true },
    trueType: { value: defaultSwitchNodeConfig.trueType!, required: true },
    falseValue: { value: defaultSwitchNodeConfig.falseValue!, required: true },
    falseType: { value: defaultSwitchNodeConfig.falseType!, required: true },
    seperatedOutputs: {
      value: defaultSwitchNodeConfig.seperatedOutputs!,
      required: false,
    },
    outputs: { value: defaultSwitchNodeConfig.outputs!, required: true },
  },
  outputLabels: function (index) {
    if (this.seperatedOutputs) {
      return index === 0 ? "true" : "false";
    } else if (index === 0) {
      return "switch result";
    }
  },
  icon: "switch.svg",
  label: function () {
    return this.name || "switch";
  },
  oneditprepare: function () {
    BaseNodeEditor.oneditprepare!.call(this);

    $("#node-input-target").typedInput({
      types: ["msg"],
    });

    $("#node-input-trueValue").typedInput({
      types: ["msg", "str", "num", "bool"],
      typeField: "#node-input-trueType",
    });

    $("#node-input-falseValue").typedInput({
      types: ["msg", "str", "num", "bool"],
      typeField: "#node-input-falseType",
    });

    $("#node-input-seperatedOutputs").on("change", function () {
      const outputs = $(this).is(":checked") ? 2 : 1;
      $("#node-input-outputs").val(outputs);
    });
  },
};

export default SwitchNodeEditor;

export { SwitchNodeType };
