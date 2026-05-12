import {
  buildEditorMetadata,
  buildEditorNodeDef,
  buildEditorTemplate,
  NodeEditorDefinition,
} from "../base/editor";
import AutomationGateNode from "./";
import {
  AutomationGateEditorNodeProperties,
  AutomationGateNodeOptions,
  AutomationGateNodeOptionsDefaults,
} from "./types";

const AutomationGateDef: NodeEditorDefinition<
  AutomationGateNodeOptions,
  AutomationGateEditorNodeProperties
> = {
  localePrefix: "flowctrl.automation-gate",
  nodeClass: AutomationGateNode,
  icon: "font-awesome/fa-chain-broken",
  defaults: AutomationGateNodeOptionsDefaults,
  inputMode: "msg-property",
  inputKeys: ["gate", "pause"],
  outputKeys: ["message"],
  baseTemplate: "full",
  form: {
    id: "automation-gate-options",
    fields: [
      { type: "checkbox", key: "startupState", icon: "play" },
      { type: "checkbox", key: "autoReplay", icon: "refresh" },
      { type: "line" },
      { type: "text", key: "stateOpenLabel", icon: "tag", i18nDefault: true },
      { type: "text", key: "stateClosedLabel", icon: "tag", i18nDefault: true },
      { type: "line" },
      { type: "checkbox", key: "setAutomationInProgress", icon: "play-circle" },
      {
        type: "text",
        key: "automationProgressId",
        icon: "tag",
        dependsOn: "setAutomationInProgress",
      },
    ],
  },
};

export const AutomationGateEditorTemplate =
  buildEditorTemplate(AutomationGateDef);
export const AutomationGateEditorMetadata =
  buildEditorMetadata(AutomationGateDef);

export default buildEditorNodeDef(AutomationGateDef);
