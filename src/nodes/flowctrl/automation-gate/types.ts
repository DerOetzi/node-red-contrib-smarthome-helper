import { BaseNodeConfig, BaseNodeEditorProperties } from "../base/types";

export interface AutomationGateNodeConfig extends BaseNodeConfig {
  startupState: boolean;
  autoReplay: boolean;
  stateOpenLabel: string;
  stateClosedLabel: string;
}

export const defaultAutomationGateNodeConfig: Partial<AutomationGateNodeConfig> =
  {
    startupState: true,
    autoReplay: true,
    stateOpenLabel: "Automated",
    stateClosedLabel: "Manual",
  };

export interface AutomationGateNodeEditorProperties
  extends BaseNodeEditorProperties {
  startupState: boolean;
  autoReplay: boolean;
  stateOpenLabel: string;
  stateClosedLabel: string;
}
