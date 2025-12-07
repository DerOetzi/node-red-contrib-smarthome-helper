import { EditorNodeDef } from "node-red";
import BaseEditorNode, {
  createEditorDefaults,
  i18n,
  i18nFieldDefault,
  i18nOutputLabel,
  NodeEditorFormBuilder,
} from "../base/editor";
import AutomationGateNode from "./";
import {
  AutomationGateEditorNodeProperties,
  AutomationGateNodeOptions,
  AutomationGateNodeOptionsDefaults,
} from "./types";

const AutomationGateEditorNode: EditorNodeDef<AutomationGateEditorNodeProperties> =
  {
    category: AutomationGateNode.NodeCategoryLabel,
    color: AutomationGateNode.NodeColor,
    icon: "font-awesome/fa-chain-broken",
    defaults: createEditorDefaults<
      AutomationGateNodeOptions,
      AutomationGateEditorNodeProperties
    >(AutomationGateNodeOptionsDefaults),
    label: function () {
      return this.name?.trim()
        ? this.name.trim()
        : i18n("flowctrl.automation-gate.name");
    },
    inputs: AutomationGateNodeOptionsDefaults.inputs,
    outputs: AutomationGateNodeOptionsDefaults.outputs,
    outputLabels: function (_index) {
      return i18nOutputLabel("flowctrl.automation-gate", "message");
    },
    onadd: function () {
      this.stateOpenLabel = i18nFieldDefault(
        "flowctrl.automation-gate",
        "stateOpenLabel"
      );
      this.stateClosedLabel = i18nFieldDefault(
        "flowctrl.automation-gate",
        "stateClosedLabel"
      );
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
          value: this.automationProgressId,
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
