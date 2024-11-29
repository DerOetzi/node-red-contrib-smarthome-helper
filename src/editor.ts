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
import EventMapperNodeEditor from "./nodes/helper/event-mapper/editor";
import { EventMapperNodeType } from "./nodes/helper/event-mapper/types";
import HeatModeSelectNodeEditor, {
  HeatModeSelectNodeType,
} from "./nodes/helper/heatmode-select/editor";
import LightControllerNodeEditor from "./nodes/helper/light-controller/editor";
import { LightControllerNodeType } from "./nodes/helper/light-controller/types";
import MotionControllerNodeEditor from "./nodes/helper/motion-controller/editor";
import { MotionControllerNodeType } from "./nodes/helper/motion-controller/types";
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
import ToggleNodeEditor from "./nodes/logical/toggle/editor";
import { ToggleNodeType } from "./nodes/logical/toggle/types";

declare const RED: EditorRED;

const nodes: Record<string, any> = {
  [AutomationGateNodeType.fullName]: AutomationGateNodeEditor,
  [BaseNodeType.fullName]: BaseNodeEditor,
  [CompareNodeType.fullName]: CompareNodeEditor,
  [EventMapperNodeType.fullName]: EventMapperNodeEditor,
  [GateControlNodeType.fullName]: GateControlNodeEditor,
  [HeatModeSelectNodeType.fullName]: HeatModeSelectNodeEditor,
  [LightControllerNodeType.fullName]: LightControllerNodeEditor,
  [LogicalOpNodeType.fullName]: LogicalOpNodeEditor,
  [MatchJoinNodeType.fullName]: MatchJoinNodeEditor,
  [MotionControllerNodeType.fullName]: MotionControllerNodeEditor,
  [NotifyDispatcherNodeType.fullName]: NotifyDispatcherNodeEditor,
  [SwitchNodeType.fullName]: SwitchNodeEditor,
  [ToggleNodeType.fullName]: ToggleNodeEditor,
  [WindowReminderNodeType.fullName]: WindowReminderNodeEditor,
};

let type: string;
for (type in nodes) {
  RED.nodes.registerType(type, nodes[type]);
}
