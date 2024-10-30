import { EditorNodeDef } from "node-red";
import { NodeType } from "../../../const";
import BaseNodeEditor from "../base/editor";
import {
  defaultGateControlNodeConfig,
  GateControlNodeEditorProperties,
} from "./types";

const nodeType = NodeType.FlowCtrlGateControl;

const GateControlNodeEditor: EditorNodeDef<GateControlNodeEditorProperties> = {
  ...BaseNodeEditor,
  color: nodeType.color,
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
