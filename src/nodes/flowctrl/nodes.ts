import { NodeRegistryEntry } from "../types";
import AutomationGateNode from "./automation-gate";
import AutomationGateEditorNode from "./automation-gate/editor";
import BaseNode from "./base";
import BaseEditorNode from "./base/editor";
import GateControlNode from "./gate-control";
import GateControlEditorNode from "./gate-control/editor";
import MatchJoinNode from "./match-join";
import MatchJoinEditorNode from "./match-join/editor";
import StatusNode from "./status";
import StatusEditorNode from "./status/editor";

const AutomationGateEditorMetadata: NodeRegistryEntry["metadata"] = {
  localePrefix: "flowctrl.automation-gate",
  inputMode: "msg-property",
  fieldKeys: [
    "startupState",
    "autoReplay",
    "stateOpenLabel",
    "stateClosedLabel",
    "setAutomationInProgress",
    "automationProgressId",
  ],
  inputKeys: ["gate", "pause"],
  outputKeys: ["message"],
};

const BaseEditorMetadata: NodeRegistryEntry["metadata"] = {
  localePrefix: "flowctrl.base",
  inputMode: "msg-property",
  fieldKeys: [
    "name",
    "topic",
    "filterUniquePayload",
    "newMsg",
    "debounce",
    "debounceTopic",
    "debounceShowStatus",
    "debounceTime",
    "debounceLeading",
    "debounceTrailing",
    "statusReportingEnabled",
    "statusItem",
    "statusTextItem",
  ],
  inputKeys: [],
  outputKeys: [],
};

const GateControlEditorMetadata: NodeRegistryEntry["metadata"] = {
  localePrefix: "flowctrl.gate-control",
  inputMode: "msg-property",
  fieldKeys: ["delay", "gateCommand", "pauseTime"],
  inputKeys: [],
  outputKeys: [],
};

const MatchJoinEditorMetadata: NodeRegistryEntry["metadata"] = {
  localePrefix: "flowctrl.match-join",
  inputMode: "matcher-topic",
  fieldKeys: ["discardNotMatched", "join", "minMsgCount", "target"],
  inputKeys: [],
  outputKeys: [],
};

const StatusEditorMetadata: NodeRegistryEntry["metadata"] = {
  localePrefix: "flowctrl.status",
  inputMode: "msg-property",
  fieldKeys: ["scope", "initialActive"],
  inputKeys: ["activeCondition"],
  outputKeys: ["status", "statusText"],
};

export const FlowCtrlNodesRegistry: { [key: string]: NodeRegistryEntry } = {
  [AutomationGateNode.NodeTypeName]: {
    node: AutomationGateNode,
    editor: AutomationGateEditorNode,
    metadata: AutomationGateEditorMetadata,
  },
  [BaseNode.NodeTypeName]: {
    node: BaseNode,
    editor: BaseEditorNode,
    metadata: BaseEditorMetadata,
  },
  [GateControlNode.NodeTypeName]: {
    node: GateControlNode,
    editor: GateControlEditorNode,
    metadata: GateControlEditorMetadata,
  },
  [MatchJoinNode.NodeTypeName]: {
    node: MatchJoinNode,
    editor: MatchJoinEditorNode,
    metadata: MatchJoinEditorMetadata,
  },
  [StatusNode.NodeTypeName]: {
    node: StatusNode,
    editor: StatusEditorNode,
    metadata: StatusEditorMetadata,
  },
};
