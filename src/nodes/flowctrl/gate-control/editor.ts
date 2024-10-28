import { EditorNodeDef } from "node-red";
import { NodeType } from "../../../const";
import CommonNodeEditor, { CommonNodeEditorProperties } from "../common/editor";

interface GateControlNodeProperties extends CommonNodeEditorProperties {
  delay: number;
  gateCommand: string;
  pauseTime?: number;
  pauseUnit?: string;
}

const nodeType = NodeType.FlowCtrlGateControl;

const GateControlNodeEditor: EditorNodeDef<GateControlNodeProperties> = {
  ...CommonNodeEditor,
  color: nodeType.color,
  defaults: {
    ...CommonNodeEditor.defaults,
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
    if (CommonNodeEditor.oneditprepare) {
      CommonNodeEditor.oneditprepare.call(this);
    }

    $("#pause-options").toggle($("#node-input-gateCommand").val() === "pause");

    $("#node-input-gateCommand").on("change", function () {
      $("#pause-options").toggle($(this).val() === "pause");
    });
  },
};

export default GateControlNodeEditor;
