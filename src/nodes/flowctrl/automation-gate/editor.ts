import { EditorNodeDef } from "node-red";
import BaseNodeEditor, { NodeEditorFormBuilder } from "../base/editor";
import AutomationGateNode from "./";
import {
  AutomationGateEditorNodeProperties,
  AutomationGateEditorNodePropertiesDefaults,
} from "./types";

const AutomationGateNodeEditor: EditorNodeDef<AutomationGateEditorNodeProperties> =
  {
    category: AutomationGateNode.NodeCategory.label,
    color: AutomationGateNode.NodeColor,
    icon: "font-awesome/fa-chain-broken",
    defaults: AutomationGateEditorNodePropertiesDefaults,
    label: function () {
      return this.name || AutomationGateNode.NodeType;
    },
    outputLabels: ["Messages when gate is open", "Gate state updates"],
    oneditprepare: function () {
      BaseNodeEditor.oneditprepare!.call(this);

      const automationGateOptionsBuilder = new NodeEditorFormBuilder(
        $("#automation-gate-options"),
        "flowctrl.automation-gate",
        this._.bind(this)
      );

      automationGateOptionsBuilder.createCheckboxInput(
        "node-input-startupState",
        "startupState",
        this.startupState,
        "play"
      );

      automationGateOptionsBuilder.createNumberInput(
        "node-input-initializeDelay",
        "initializeDelay",
        this.initializeDelay!,
        "pause"
      );

      automationGateOptionsBuilder.createCheckboxInput(
        "node-input-autoReplay",
        "autoReplay",
        this.autoReplay,
        "refresh"
      );

      automationGateOptionsBuilder.line();

      if (!this.stateOpenLabel) {
        this.stateOpenLabel = this._(
          "flowctrl.automation-gate.default.stateOpenLabel"
        );
      }

      automationGateOptionsBuilder.createTextInput(
        "node-input-stateOpenLabel",
        "stateOpenLabel",
        this.stateOpenLabel!,
        "tag"
      );

      if (!this.stateClosedLabel) {
        this.stateClosedLabel = this._(
          "flowctrl.automation-gate.default.stateClosedLabel"
        );
      }

      automationGateOptionsBuilder.createTextInput(
        "node-input-stateClosedLabel",
        "stateClosedLabel",
        this.stateClosedLabel!,
        "tag"
      );

      automationGateOptionsBuilder.line();

      const setAutomationInProgressCheckbox =
        automationGateOptionsBuilder.createCheckboxInput(
          "node-input-setAutomationInProgress",
          "setAutomationInProgress",
          this.setAutomationInProgress,
          "play-circle"
        );

      const automationProgressIdInputRow = automationGateOptionsBuilder
        .createTextInput(
          "node-input-automationProgressId",
          "automationProgressId",
          this.automationProgressId!,
          "tag"
        )
        .parent()
        .toggle(this.setAutomationInProgress);

      setAutomationInProgressCheckbox.on("change", function () {
        automationProgressIdInputRow.toggle($(this).is(":checked"));
      });
    },
  };

export default AutomationGateNodeEditor;
