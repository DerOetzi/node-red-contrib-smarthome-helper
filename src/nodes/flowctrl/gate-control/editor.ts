import { EditorNodeDef } from "node-red";
import { NodeType } from "../../../const";
import BaseNodeEditor, { BaseNodeEditorProperties } from "../base/editor";

interface GateControlNodeProperties extends BaseNodeEditorProperties {
  delay: number;
  gateCommand: string;
  pauseTime?: number;
  pauseUnit?: string;
}

const nodeType = NodeType.FlowCtrlGateControl;

const GateControlNodeEditor: EditorNodeDef<GateControlNodeProperties> = {
  ...BaseNodeEditor,
  color: nodeType.color,
  defaults: {
    ...BaseNodeEditor.defaults,
    delay: { value: 100, required: true },
    gateCommand: { value: "start", required: true },
    pauseTime: { value: 1, required: false },
    pauseUnit: { value: "s", required: false },
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
