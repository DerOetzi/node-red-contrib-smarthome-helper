import { EditorNodeDef } from "node-red";
import BaseEditorNode, { i18n, NodeEditorFormBuilder } from "../base/editor";
import AutomationGateNode from "./";
import {
  AutomationGateEditorNodeProperties,
  AutomationGateEditorNodePropertiesDefaults,
  AutomationGateNodeOptionsDefaults,
} from "./types";

const AutomationGateEditorNode: EditorNodeDef<AutomationGateEditorNodeProperties> =
  {
    category: AutomationGateNode.NodeCategory.label,
    color: AutomationGateNode.NodeColor,
    icon: "font-awesome/fa-chain-broken",
    defaults: AutomationGateEditorNodePropertiesDefaults,
    label: function () {
      return this.name || i18n("flowctrl.automation-gate.name");
    },
    inputs: AutomationGateNodeOptionsDefaults.inputs,
    outputs: AutomationGateNodeOptionsDefaults.outputs,
    outputLabels: ["Messages when gate is open", "Gate state updates"],
    onadd: function () {
      this.stateOpenLabel = i18n("flowctrl.automation-gate.stateOpenLabel");
      this.stateClosedLabel = i18n("flowctrl.automation-gate.stateClosedLabel");
    },
    oneditprepare: function () {
      BaseEditorNode.oneditprepare!.call(this);

      const automationGateOptionsBuilder = new NodeEditorFormBuilder(
        $("#automation-gate-options"),
        {
          translatePrefix: "flowctrl.automation-gate",
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
        value: this.initializeDelay,
        valueType: this.initializeDelayUnit,
        icon: "pause",
      });

      automationGateOptionsBuilder.createCheckboxInput({
        id: "node-input-autoReplay",
        label: "autoReplay",
        value: this.autoReplay,
        icon: "refresh",
      });

      automationGateOptionsBuilder.line();

      automationGateOptionsBuilder.createTextInput({
        id: "node-input-stateOpenLabel",
        label: "stateOpenLabel",
        value: this.stateOpenLabel,
        icon: "tag",
      });

      automationGateOptionsBuilder.createTextInput({
        id: "node-input-stateClosedLabel",
        label: "stateClosedLabel",
        value: this.stateClosedLabel,
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

export default AutomationGateEditorNode;
