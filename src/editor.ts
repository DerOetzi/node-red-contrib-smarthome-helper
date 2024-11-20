import { EditorRED } from "node-red";
import AutomationGateNodeEditor, {
  AutomationGateNodeType,
} from "./nodes/flowctrl/automation-gate/editor";
import BaseNodeEditor, { BaseNodeType } from "./nodes/flowctrl/base/editor";
import GateControlNodeEditor, {
  GateControlNodeType,
} from "./nodes/flowctrl/gate-control/editor";
import MatchJoinNodeEditor, {
  MatchJoinNodeType,
} from "./nodes/flowctrl/match-join/editor";
import HeatModeSelectNodeEditor, {
  HeatModeSelectNodeType,
} from "./nodes/helper/heatmode-select/editor";
import NotifyDispatcherNodeEditor from "./nodes/helper/notify-dispatcher/editor";
import { NotifyDispatcherNodeType } from "./nodes/helper/notify-dispatcher/types";
import WindowReminderNodeEditor from "./nodes/helper/window-reminder/editor";
import { WindowReminderNodeType } from "./nodes/helper/window-reminder/types";
import CompareNodeEditor, {
  CompareNodeType,
} from "./nodes/logical/compare/editor";
import LogicalOpNodeEditor, {
  LogicalOpNodeType,
} from "./nodes/logical/op/editor";
import SwitchNodeEditor from "./nodes/logical/switch/editor";
import { SwitchNodeType } from "./nodes/logical/switch/types";

declare const RED: EditorRED;

const nodes: Record<string, any> = {
  [BaseNodeType.fullName]: BaseNodeEditor,
  [AutomationGateNodeType.fullName]: AutomationGateNodeEditor,
  [GateControlNodeType.fullName]: GateControlNodeEditor,
  [MatchJoinNodeType.fullName]: MatchJoinNodeEditor,
  [CompareNodeType.fullName]: CompareNodeEditor,
  [LogicalOpNodeType.fullName]: LogicalOpNodeEditor,
  [SwitchNodeType.fullName]: SwitchNodeEditor,
  [HeatModeSelectNodeType.fullName]: HeatModeSelectNodeEditor,
  [NotifyDispatcherNodeType.fullName]: NotifyDispatcherNodeEditor,
  [WindowReminderNodeType.fullName]: WindowReminderNodeEditor,
};

let type: string;
for (type in nodes) {
  RED.nodes.registerType(type, nodes[type]);
}
