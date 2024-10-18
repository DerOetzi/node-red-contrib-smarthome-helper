import { EditorNodeDef } from "node-red";
import { NodeType } from "../../../const";
import {
  BaseNodeEditorProperties,
  baseNodeEditorPropertiesDefaults,
} from "../../../editor/types";

interface GateNodeProperties extends BaseNodeEditorProperties {
  startupState: boolean;
  autoReplay: boolean;
  filterUniquePayload: boolean;
}

const nodeType = NodeType.AutomationGate;

const AutomationGateNodeEditor: EditorNodeDef<GateNodeProperties> = {
  category: nodeType.category.label,
  color: nodeType.color,
  defaults: {
    startupState: { value: true },
    autoReplay: { value: true },
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
