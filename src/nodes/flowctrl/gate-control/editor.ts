import { EditorNodeDef } from "node-red";
import BaseEditorNode, {
  createEditorDefaults,
  NodeEditorFormBuilder,
} from "../base/editor";
import GateControlNode from "./";
import {
  GateControlEditorNodeProperties,
  GateControlNodeOptions,
  GateControlNodeOptionsDefaults,
} from "./types";

const GateControlEditorNode: EditorNodeDef<GateControlEditorNodeProperties> = {
  category: GateControlNode.NodeCategoryLabel,
  color: GateControlNode.NodeColor,
  icon: "font-awesome/fa-key",
  defaults: createEditorDefaults<
    GateControlNodeOptions,
    GateControlEditorNodeProperties
  >(GateControlNodeOptionsDefaults),
  label: function () {
    let label = this.name?.trim() ? this.name.trim() : this.gateCommand;

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
      options: ["start", "stop", "pause", "replay", "resetFilter"],
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
