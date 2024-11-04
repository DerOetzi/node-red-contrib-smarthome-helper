import { NodeColor, NodeType } from "../../types";
import { BaseNodeConfig, BaseNodeEditorProperties } from "../base/types";
import { flowctrlCategory } from "../types";

export interface AutomationGateNodeConfig extends BaseNodeConfig {
  startupState: boolean;
  statusDelay: number;
  autoReplay: boolean;
  stateOpenLabel: string;
  stateClosedLabel: string;
}

export const defaultAutomationGateNodeConfig: Partial<AutomationGateNodeConfig> =
  {
    startupState: true,
    statusDelay: 100,
    autoReplay: true,
    stateOpenLabel: "Automated",
    stateClosedLabel: "Manual",
  };

export interface AutomationGateNodeEditorProperties
  extends BaseNodeEditorProperties {
  startupState: boolean;
  statusDelay: number;
  autoReplay: boolean;
  stateOpenLabel: string;
  stateClosedLabel: string;
}

export const AutomationGateNodeType = new NodeType(
  flowctrlCategory,
  "automation-gate",
  NodeColor.AutomationGate
);
