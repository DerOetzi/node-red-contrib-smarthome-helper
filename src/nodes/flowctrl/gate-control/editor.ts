import { EditorNodeDef } from "node-red";
import { NodeType } from "../../../const";
import {
  BaseNodeEditorProperties,
  baseNodeEditorPropertiesDefaults,
} from "../../../editor/types";

interface GateControlNodeProperties extends BaseNodeEditorProperties {
  delay: number;
  gateCommand: string;
  pauseTime?: number;
  pauseUnit?: string;
}

const nodeType = NodeType.GateControl;

const GateControlNodeEditor: EditorNodeDef<GateControlNodeProperties> = {
  category: nodeType.category.label,
  color: nodeType.color,
  defaults: {
    delay: { value: 100, required: true },
    gateCommand: { value: "start", required: true },
    pauseTime: { value: 1, required: false },
    pauseUnit: { value: "s", required: false },
    ...baseNodeEditorPropertiesDefaults,
  },
  inputs: 1,
  outputs: 2,
  outputLabels: ["Delayed Message Output", "Gate Command Output"],
  icon: "timer.svg",
  label: function () {
    let label = this.name || this.gateCommand;

    if (this.gateCommand === "pause") {
      label += " (" + this.pauseTime + " " + this.pauseUnit + ")";
    }

    return label;
  },
  oneditprepare: function () {
    $("#pause-options").toggle($("#node-input-gateCommand").val() === "pause");

    $("#node-input-gateCommand").on("change", function () {
      $("#pause-options").toggle($(this).val() === "pause");
    });

    $("#node-input-topic").typedInput({
      types: ["msg", "str"],
      typeField: "#node-input-topicType",
    });
  },
};

export default GateControlNodeEditor;
