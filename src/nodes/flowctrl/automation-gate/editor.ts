import { EditorNodeDef } from "node-red";
import { NodeType } from "../../../const";
import BaseNodeEditor from "../base/editor";
import {
  AutomationGateNodeEditorProperties,
  defaultAutomationGateNodeConfig,
} from "./types";

const nodeType = NodeType.FlowCtrlAutomationGate;

const AutomationGateNodeEditor: EditorNodeDef<AutomationGateNodeEditorProperties> =
  {
    ...BaseNodeEditor,
    color: nodeType.color,
    defaults: {
      ...BaseNodeEditor.defaults,
      startupState: {
        value: defaultAutomationGateNodeConfig.startupState!,
        required: false,
      },
      statusDelay: {
        value: defaultAutomationGateNodeConfig.statusDelay!,
        required: false,
      },
      autoReplay: {
        value: defaultAutomationGateNodeConfig.autoReplay!,
        required: false,
      },
      stateOpenLabel: {
        value: defaultAutomationGateNodeConfig.stateOpenLabel!,
        required: true,
      },
      stateClosedLabel: {
        value: defaultAutomationGateNodeConfig.stateClosedLabel!,
        required: true,
      },
    },
    label: function () {
      return this.name || nodeType.name;
    },
    outputs: 2,
    outputLabels: ["Messages when gate is open", "Gate state updates"],
    icon: "gate.png",
  };

export default AutomationGateNodeEditor;
