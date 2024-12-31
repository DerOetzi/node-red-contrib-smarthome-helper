import { EditorNodeDef } from "node-red";
import BaseNodeEditor, { NodeEditorFormBuilder } from "../base/editor";
import GateControlNode from "./";
import {
  GateControlEditorNodeProperties,
  GateControlEditorNodePropertiesDefaults,
  GateControlNodeOptionsDefaults,
} from "./types";

const GateControlNodeEditor: EditorNodeDef<GateControlEditorNodeProperties> = {
  category: GateControlNode.NodeCategory.label,
  color: GateControlNode.NodeColor,
  icon: "font-awesome/fa-key",
  defaults: GateControlEditorNodePropertiesDefaults,
  label: function () {
    let label = this.name || this.gateCommand;

    if (this.gateCommand === "pause") {
      label += " (" + this.pauseTime + " " + this.pauseUnit + ")";
    }

    return label;
  },
  inputs: GateControlNodeOptionsDefaults.inputs,
  outputs: GateControlNodeOptionsDefaults.outputs,
  outputLabels: ["Delayed Message Output", "Gate Command Output"],
  oneditprepare: function () {
    BaseNodeEditor.oneditprepare!.call(this);

    const gateControlOptionsBuilder = new NodeEditorFormBuilder(
      $("#gate-control-options"),
      "flowctrl.gate-control",
      this._.bind(this)
    );

    gateControlOptionsBuilder.createNumberInput(
      "node-input-delay",
      "delay",
      this.delay,
      "clock-o"
    );

    const gateCommandSelect = gateControlOptionsBuilder.createSelectInput(
      "node-input-gateCommand",
      "gateCommand",
      this.gateCommand,
      ["start", "stop", "pause", "replay", "reset_filter"],
      "comment"
    );

    const gatePauseTimeRow = gateControlOptionsBuilder
      .createTimeInput(
        "node-input-pauseTime",
        "node-input-pauseUnit",
        "pauseTime",
        this.pauseTime!,
        this.pauseUnit!,
        "hourglass-half"
      )
      .parent()
      .toggle(this.gateCommand === "pause");

    gateCommandSelect.on("change", function () {
      gatePauseTimeRow.toggle($(this).val() === "pause");
    });
  },
};

export default GateControlNodeEditor;
