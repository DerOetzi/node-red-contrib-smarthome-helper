import { EditorNodeDef, EditorNodeProperties } from "node-red";

interface GateNodeProperties extends EditorNodeProperties {
  startupState: boolean;
  autoReplay: boolean;
  filterUniquePayload: boolean;
}

const AutomationGateNodeEditor: EditorNodeDef<GateNodeProperties> = {
  category: "Smarthome Flow Control",
  color: "#a6bbcf",
  defaults: {
    name: { value: "" },
    startupState: { value: true },
    autoReplay: { value: true },
    filterUniquePayload: { value: false },
  },
  inputs: 1,
  outputs: 2,
  outputLabels: ["Messages when gate is open", "Gate state updates"],
  icon: "gate.png",
  label: function () {
    return this.name ?? "automation-gate";
  },
};

export default AutomationGateNodeEditor;
