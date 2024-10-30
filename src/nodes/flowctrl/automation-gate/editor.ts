import { EditorNodeDef } from "node-red";
import { NodeType } from "../../../const";
import BaseNodeEditor, { BaseNodeEditorProperties } from "../base/editor";

interface GateNodeProperties extends BaseNodeEditorProperties {
  startupState: boolean;
  autoReplay: boolean;
  stateOpenLabel: string;
  stateClosedLabel: string;
  filterUniquePayload: boolean;
}

const nodeType = NodeType.FlowCtrlAutomationGate;

const AutomationGateNodeEditor: EditorNodeDef<GateNodeProperties> = {
  ...BaseNodeEditor,
  color: nodeType.color,
  defaults: {
    ...BaseNodeEditor.defaults,
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
