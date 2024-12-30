import { EditorNodePropertiesDef, NodeMessage } from "node-red";
import {
  BaseEditorNodeProperties,
  BaseEditorNodePropertiesDefaults,
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
}

export const AutomationGateNodeOptionsDefaults: AutomationGateNodeOptions = {
  ...BaseNodeOptionsDefaults,
  startupState: true,
  autoReplay: true,
  stateOpenLabel: "",
  stateClosedLabel: "",
  setAutomationInProgress: false,
  automationProgressId: "",
  outputs: 2,
};

export interface AutomationGateNodeDef
  extends BaseNodeDef,
    AutomationGateNodeOptions {}

export interface AutomationGateEditorNodeProperties
  extends BaseEditorNodeProperties,
    AutomationGateNodeOptions {}

export const AutomationGateEditorNodePropertiesDefaults: EditorNodePropertiesDef<AutomationGateEditorNodeProperties> =
  {
    ...BaseEditorNodePropertiesDefaults,
    startupState: {
      value: AutomationGateNodeOptionsDefaults.startupState,
      required: true,
    },
    initializeDelay: {
      value: AutomationGateNodeOptionsDefaults.initializeDelay,
      required: true,
    },
    initializeDelayUnit: {
      value: AutomationGateNodeOptionsDefaults.initializeDelayUnit,
      required: true,
    },
    autoReplay: {
      value: AutomationGateNodeOptionsDefaults.autoReplay,
      required: true,
    },
    setAutomationInProgress: {
      value: AutomationGateNodeOptionsDefaults.setAutomationInProgress,
      required: false,
    },
    automationProgressId: {
      value: AutomationGateNodeOptionsDefaults.automationProgressId,
      required: false,
    },
    stateOpenLabel: {
      value: AutomationGateNodeOptionsDefaults.stateOpenLabel,
      required: true,
    },
    stateClosedLabel: {
      value: AutomationGateNodeOptionsDefaults.stateClosedLabel,
      required: true,
    },
    outputs: {
      value: AutomationGateNodeOptionsDefaults.outputs,
      required: true,
    },
  };

export enum AutomationGateCommand {
  Pause = "pause",
  Stop = "stop",
  Start = "start",
  Replay = "replay",
  ResetFilter = "reset_filter",
}

export interface AutomationGateNodeMessage extends NodeMessage {
  gate?: AutomationGateCommand;
  pause?: number;
  originalMsg?: NodeMessage;
}
