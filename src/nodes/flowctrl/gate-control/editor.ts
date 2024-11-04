import { EditorNodeDef } from "node-red";
import BaseNodeEditor from "../base/editor";
import {
  defaultGateControlNodeConfig,
  GateControlNodeEditorProperties,
  GateControlNodeType,
} from "./types";

const GateControlNodeEditor: EditorNodeDef<GateControlNodeEditorProperties> = {
  ...BaseNodeEditor,
  color: GateControlNodeType.color,
  defaults: {
    ...BaseNodeEditor.defaults,
    delay: { value: defaultGateControlNodeConfig.delay!, required: true },
    gateCommand: {
      value: defaultGateControlNodeConfig.gateCommand!,
      required: true,
    },
    pauseTime: {
      value: defaultGateControlNodeConfig.pauseTime!,
      required: false,
    },
    pauseUnit: {
      value: defaultGateControlNodeConfig.pauseUnit!,
      required: false,
    },
  },
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
    if (BaseNodeEditor.oneditprepare) {
      BaseNodeEditor.oneditprepare.call(this);
    }

    $("#pause-options").toggle($("#node-input-gateCommand").val() === "pause");

    $("#node-input-gateCommand").on("change", function () {
      $("#pause-options").toggle($(this).val() === "pause");
    });
  },
};

export default GateControlNodeEditor;

export { GateControlNodeType };
