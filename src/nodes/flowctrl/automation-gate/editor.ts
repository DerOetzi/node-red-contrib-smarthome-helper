import { EditorNodeDef } from "node-red";
import BaseNodeEditor, { NodeEditorFormBuilder } from "../base/editor";
import AutomationGateNode from "./";
import {
  AutomationGateEditorNodeProperties,
  AutomationGateEditorNodePropertiesDefaults,
  AutomationGateNodeOptionsDefaults,
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
    inputs: AutomationGateNodeOptionsDefaults.inputs,
    outputs: AutomationGateNodeOptionsDefaults.outputs,
    outputLabels: ["Messages when gate is open", "Gate state updates"],
    oneditprepare: function () {
      BaseNodeEditor.oneditprepare!.call(this);

      const automationGateOptionsBuilder = new NodeEditorFormBuilder(
        $("#automation-gate-options"),
        {
          translatePrefix: "flowctrl.automation-gate",
          translate: this._.bind(this),
        }
      );

      automationGateOptionsBuilder.createCheckboxInput({
        id: "node-input-startupState",
        label: "startupState",
        value: this.startupState,
        icon: "play",
      });

      automationGateOptionsBuilder.createTimeInput({
        id: "node-input-initializeDelay",
        idType: "node-input-initializeDelayUnit",
        label: "initializeDelay",
        value: this.initializeDelay!,
        valueType: this.initializeDelayUnit!,
        icon: "pause",
      });

      automationGateOptionsBuilder.createCheckboxInput({
        id: "node-input-autoReplay",
        label: "autoReplay",
        value: this.autoReplay,
        icon: "refresh",
      });

      automationGateOptionsBuilder.line();

      if (!this.stateOpenLabel) {
        this.stateOpenLabel = this._(
          "flowctrl.automation-gate.default.stateOpenLabel"
        );
      }

      automationGateOptionsBuilder.createTextInput({
        id: "node-input-stateOpenLabel",
        label: "stateOpenLabel",
        value: this.stateOpenLabel!,
        icon: "tag",
      });

      if (!this.stateClosedLabel) {
        this.stateClosedLabel = this._(
          "flowctrl.automation-gate.default.stateClosedLabel"
        );
      }

      automationGateOptionsBuilder.createTextInput({
        id: "node-input-stateClosedLabel",
        label: "stateClosedLabel",
        value: this.stateClosedLabel!,
        icon: "tag",
      });

      automationGateOptionsBuilder.line();

      const setAutomationInProgressCheckbox =
        automationGateOptionsBuilder.createCheckboxInput({
          id: "node-input-setAutomationInProgress",
          label: "setAutomationInProgress",
          value: this.setAutomationInProgress,
          icon: "play-circle",
        });

      const automationProgressIdInputRow = automationGateOptionsBuilder
        .createTextInput({
          id: "node-input-automationProgressId",
          label: "automationProgressId",
          value: this.automationProgressId!,
          icon: "tag",
        })
        .parent()
        .toggle(this.setAutomationInProgress);

      setAutomationInProgressCheckbox.on("change", function () {
        automationProgressIdInputRow.toggle($(this).is(":checked"));
      });
    },
  };

export default AutomationGateNodeEditor;
