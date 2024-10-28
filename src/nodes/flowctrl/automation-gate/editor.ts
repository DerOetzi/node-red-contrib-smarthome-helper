import { EditorNodeDef } from "node-red";
import { NodeType } from "../../../const";
import CommonNodeEditor, { CommonNodeEditorProperties } from "../common/editor";

interface GateNodeProperties extends CommonNodeEditorProperties {
  startupState: boolean;
  autoReplay: boolean;
  stateOpenLabel: string;
  stateClosedLabel: string;
  filterUniquePayload: boolean;
}

const nodeType = NodeType.FlowCtrlAutomationGate;

const AutomationGateNodeEditor: EditorNodeDef<GateNodeProperties> = {
  ...CommonNodeEditor,
  color: nodeType.color,
  defaults: {
    ...CommonNodeEditor.defaults,
    startupState: { value: true },
    autoReplay: { value: true },
    stateOpenLabel: { value: "Automated", required: true },
    stateClosedLabel: { value: "Manual", required: true },
  },
  label: function () {
    return this.name || nodeType.name;
  },
  outputs: 2,
  outputLabels: ["Messages when gate is open", "Gate state updates"],
  icon: "gate.png",
};

export default AutomationGateNodeEditor;
