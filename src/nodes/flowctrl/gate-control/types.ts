import { NodeColor, NodeType } from "../../types";
import { AutomationGateCommand } from "../automation-gate/types";
import { BaseNodeConfig, BaseNodeEditorProperties } from "../base/types";
import { flowctrlCategory } from "../types";

export interface GateControlNodeConfig extends BaseNodeConfig {
  delay: number;
  gateCommand: AutomationGateCommand;
  pauseTime?: number;
  pauseUnit?: string;
}

export const defaultGateControlNodeConfig: Partial<GateControlNodeConfig> = {
  delay: 100,
  gateCommand: AutomationGateCommand.Start,
  pauseTime: 1,
  pauseUnit: "s",
  outputs: 2,
};

export interface GateControlNodeEditorProperties
  extends BaseNodeEditorProperties {
  delay: number;
  gateCommand: string;
  pauseTime?: number;
  pauseUnit?: string;
}

export const GateControlNodeType = new NodeType(
  flowctrlCategory,
  "gate-control",
  NodeColor.AutomationGate
);
