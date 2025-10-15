import { NodeMessage } from "node-red";
import { NodeCategory } from "../../types";
import {
  BaseEditorNodeProperties,
  BaseNodeDef,
  BaseNodeOptions,
  BaseNodeOptionsDefaults,
} from "../base/types";

export interface AutomationGateNodeOptions extends BaseNodeOptions {
  startupState: boolean;
  autoReplay: boolean;
  stateOpenLabel?: string;
  stateClosedLabel?: string;
  setAutomationInProgress: boolean;
  automationProgressId: string;

  // deprecated 0.22.3
  statusDelay?: number;
}

export const AutomationGateNodeOptionsDefaults: AutomationGateNodeOptions = {
  ...BaseNodeOptionsDefaults,
  startupState: true,
  autoReplay: true,
  stateOpenLabel: "",
  stateClosedLabel: "",
  setAutomationInProgress: false,
  automationProgressId: "",
};

export interface AutomationGateNodeDef
  extends BaseNodeDef,
    AutomationGateNodeOptions {}

export interface AutomationGateEditorNodeProperties
  extends BaseEditorNodeProperties,
    AutomationGateNodeOptions {}

export enum AutomationGateCommand {
  Pause = "pause",
  Stop = "stop",
  Start = "start",
  Replay = "replay",
  ResetFilter = "resetFilter",
  ResetFilterDeprecated = "reset_filter",
}

export interface AutomationGateNodeMessage extends NodeMessage {
  gate?: AutomationGateCommand;
  pause?: number;
  originalMsg?: NodeMessage;
}

export const AutomationGateCategory: NodeCategory = {
  name: "flowctrl",
  label: "Smarthome Flow Control",
  color: "#ff7f50",
};
