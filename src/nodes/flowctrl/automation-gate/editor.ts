import { EditorNodeDef } from "node-red";
import { NodeType } from "../../../const";
import {
  BaseNodeEditorProperties,
  baseNodeEditorPropertiesDefaults,
} from "../../../editor/types";

interface GateNodeProperties extends BaseNodeEditorProperties {
  startupState: boolean;
  autoReplay: boolean;
  stateOpenLabel: string;
  stateClosedLabel: string;
  filterUniquePayload: boolean;
}

const nodeType = NodeType.FlowCtrlAutomationGate;

const AutomationGateNodeEditor: EditorNodeDef<GateNodeProperties> = {
  category: nodeType.category.label,
  color: nodeType.color,
  defaults: {
    startupState: { value: true },
    autoReplay: { value: true },
    stateOpenLabel: { value: "Automated", required: true },
    stateClosedLabel: { value: "Manual", required: true },
    ...baseNodeEditorPropertiesDefaults,
  },
  inputs: 1,
  outputs: 2,
  outputLabels: ["Messages when gate is open", "Gate state updates"],
  icon: "gate.png",
  label: function () {
    return this.name || nodeType.name;
  },
  oneditprepare: function () {
    $("#node-input-topic").typedInput({
      types: ["msg", "str"],
      typeField: "#node-input-topicType",
    });
  },
};

export default AutomationGateNodeEditor;
