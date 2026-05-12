import {
  buildEditorMetadata,
  buildEditorNodeDef,
  buildEditorTemplate,
  NodeEditorDefinition,
} from "../base/editor";
import GateControlNode from "./";
import {
  GateControlEditorNodeProperties,
  GateControlNodeOptions,
  GateControlNodeOptionsDefaults,
} from "./types";

const GateControlDef: NodeEditorDefinition<
  GateControlNodeOptions,
  GateControlEditorNodeProperties
> = {
  localePrefix: "flowctrl.gate-control",
  nodeClass: GateControlNode,
  icon: "font-awesome/fa-key",
  defaults: GateControlNodeOptionsDefaults,
  inputMode: "msg-property",
  outputKeys: ["delayed", "command"],
  baseTemplate: "without-status",
  form: {
    id: "gate-control-options",
    fields: [
      { type: "number", key: "delay", icon: "clock-o" },
      {
        type: "select",
        key: "gateCommand",
        icon: "comment",
        options: ["start", "stop", "pause", "replay", "resetFilter"],
      },
      {
        type: "time",
        key: "pauseTime",
        icon: "hourglass-half",
        dependsOn: "gateCommand",
        dependsOnValue: "pause",
      },
    ],
  },
  hooks: {
    label: (node) => {
      let label = node.name?.trim() ? node.name.trim() : node.gateCommand;
      if (node.gateCommand === "pause") {
        label += " (" + node.pauseTime + " " + node.pauseUnit + ")";
      }
      return label;
    },
  },
};

export const GateControlEditorTemplate = buildEditorTemplate(GateControlDef);
export const GateControlEditorMetadata = buildEditorMetadata(GateControlDef);

export default buildEditorNodeDef(GateControlDef);
