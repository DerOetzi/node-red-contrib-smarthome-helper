import { EditorNodeDef } from "node-red";
import BaseEditorNode, { NodeEditorFormBuilder } from "../base/editor";
import GateControlNode from "./";
import {
  GateControlEditorNodeProperties,
  GateControlEditorNodePropertiesDefaults,
  GateControlNodeOptionsDefaults,
} from "./types";

const GateControlEditorNode: EditorNodeDef<GateControlEditorNodeProperties> = {
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
    BaseEditorNode.oneditprepare!.call(this);

    const gateControlOptionsBuilder = new NodeEditorFormBuilder(
      $("#gate-control-options"),
      { translatePrefix: "flowctrl.gate-control" }
    );

    gateControlOptionsBuilder.createNumberInput({
      id: "node-input-delay",
      label: "delay",
      value: this.delay,
      icon: "clock-o",
    });

    const gateCommandSelect = gateControlOptionsBuilder.createSelectInput({
      id: "node-input-gateCommand",
      label: "gateCommand",
      value: this.gateCommand,
      options: ["start", "stop", "pause", "replay", "reset_filter"],
      icon: "comment",
    });

    const gatePauseTimeRow = gateControlOptionsBuilder
      .createTimeInput({
        id: "node-input-pauseTime",
        idType: "node-input-pauseUnit",
        label: "pauseTime",
        value: this.pauseTime!,
        valueType: this.pauseUnit!,
        icon: "hourglass-half",
      })
      .parent()
      .toggle(this.gateCommand === "pause");

    gateCommandSelect.on("change", function () {
      gatePauseTimeRow.toggle($(this).val() === "pause");
    });
  },
};

export default GateControlEditorNode;
