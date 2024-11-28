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
      setAutomationInProgress: {
        value: defaultAutomationGateNodeConfig.setAutomationInProgress!,
        required: false,
      },
      automationProgressId: {
        value: defaultAutomationGateNodeConfig.automationProgressId!,
        required: false,
      },
      outputs: {
        value: defaultAutomationGateNodeConfig.outputs!,
        required: true,
      },
    },
    label: function () {
      return this.name || AutomationGateNodeType.name;
    },
    outputLabels: ["Messages when gate is open", "Gate state updates"],
    icon: "gate.png",
    oneditprepare: function () {
      BaseNodeEditor.oneditprepare!.call(this);

      const automationProgressIdRow = $("#node-input-automationProgressId")
        .parent()
        .toggle(this.setAutomationInProgress);

      $("#node-input-setAutomationInProgress").on("change", function () {
        automationProgressIdRow.toggle($(this).is(":checked"));
      });
    },
  };

export default AutomationGateNodeEditor;

export { AutomationGateNodeType };
