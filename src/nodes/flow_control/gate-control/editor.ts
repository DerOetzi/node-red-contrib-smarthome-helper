import { EditorNodeDef, EditorNodeProperties } from "node-red";

interface GateControlNodeProperties extends EditorNodeProperties {
  delay: number;
  gateCommand: string;
  pauseTime?: number;
  pauseUnit?: string;
  enableTrigger: boolean;
}

const GateControlNodeEditor: EditorNodeDef<GateControlNodeProperties> = {
  category: "Smarthome Flow Control",
  defaults: {
    name: { value: "" },
    delay: { value: 100, required: true },
    gateCommand: { value: "start", required: true },
    pauseTime: { value: 1, required: false },
    pauseUnit: { value: "s", required: false },
    enableTrigger: { value: false },
  },
  inputs: 1,
  outputs: 2,
  outputLabels: ["Gate Command Output", "Delayed Message Output"],
  icon: "timer.svg",
  label: function () {
    let label = this.name ?? this.gateCommand;

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
  },
};

export default GateControlNodeEditor;
