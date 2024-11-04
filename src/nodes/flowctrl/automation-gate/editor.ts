import { EditorNodeDef } from "node-red";
import BaseNodeEditor from "../base/editor";
import {
  AutomationGateNodeEditorProperties,
  AutomationGateNodeType,
  defaultAutomationGateNodeConfig,
} from "./types";

const AutomationGateNodeEditor: EditorNodeDef<AutomationGateNodeEditorProperties> =
  {
    ...BaseNodeEditor,
    color: AutomationGateNodeType.color,
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
      return this.name || AutomationGateNodeType.name;
    },
    outputs: 2,
    outputLabels: ["Messages when gate is open", "Gate state updates"],
    icon: "gate.png",
  };

export default AutomationGateNodeEditor;

export { AutomationGateNodeType };
