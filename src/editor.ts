import { EditorRED } from "node-red";
import AutomationGateNode from "./nodes/flowctrl/automation-gate";
import AutomationGateEditorNode from "./nodes/flowctrl/automation-gate/editor";
import BaseNode from "./nodes/flowctrl/base";
import BaseEditorNode from "./nodes/flowctrl/base/editor";
import GateControlNode from "./nodes/flowctrl/gate-control";
import GateControlEditorNode from "./nodes/flowctrl/gate-control/editor";
import MatchJoinNode from "./nodes/flowctrl/match-join";
import MatchJoinEditorNode from "./nodes/flowctrl/match-join/editor";
import HeatingControllerNode from "./nodes/helper/climate/heating-controller";
import HeatingControllerEditorNode from "./nodes/helper/climate/heating-controller/editor";
import EventMapperNode from "./nodes/helper/control/event-mapper";
import EventMapperEditorNode from "./nodes/helper/control/event-mapper/editor";
import MotionControllerNode from "./nodes/helper/control/motion-controller";
import MotionControllerEditorNode from "./nodes/helper/control/motion-controller/editor";
import LightControllerNode from "./nodes/helper/light/light-controller";
import LightControllerEditorNode from "./nodes/helper/light/light-controller/editor";
import NotifyDispatcherNode from "./nodes/helper/notification/notify-dispatcher";
import NotifyDispatcherEditorNode from "./nodes/helper/notification/notify-dispatcher/editor";
import WindowReminderNode from "./nodes/helper/notification/window-reminder";
import WindowReminderEditorNode from "./nodes/helper/notification/window-reminder/editor";
import CompareNode from "./nodes/logical/compare";
import CompareEditorNode from "./nodes/logical/compare/editor";
import LogicalOpNode from "./nodes/logical/op";
import LogicalOpEditorNode from "./nodes/logical/op/editor";
import SwitchNode from "./nodes/logical/switch";
import SwitchEditorNode from "./nodes/logical/switch/editor";
import ToggleNode from "./nodes/logical/toggle";
import ToggleEditorNode from "./nodes/logical/toggle/editor";
import ArithmeticNode from "./nodes/operator/arithmetic";
import ArithmeticEditorNode from "./nodes/operator/arithmetic/editor";

declare const RED: EditorRED;

const nodes: Record<string, any> = {
  [ArithmeticNode.NodeTypeName]: ArithmeticEditorNode,
  [AutomationGateNode.NodeTypeName]: AutomationGateEditorNode,
  [BaseNode.NodeTypeName]: BaseEditorNode,
  [CompareNode.NodeTypeName]: CompareEditorNode,
  [EventMapperNode.NodeTypeName]: EventMapperEditorNode,
  [GateControlNode.NodeTypeName]: GateControlEditorNode,
  [HeatingControllerNode.NodeTypeName]: HeatingControllerEditorNode,
  [LightControllerNode.NodeTypeName]: LightControllerEditorNode,
  [LogicalOpNode.NodeTypeName]: LogicalOpEditorNode,
  [MatchJoinNode.NodeTypeName]: MatchJoinEditorNode,
  [MotionControllerNode.NodeTypeName]: MotionControllerEditorNode,
  [NotifyDispatcherNode.NodeTypeName]: NotifyDispatcherEditorNode,
  [SwitchNode.NodeTypeName]: SwitchEditorNode,
  [ToggleNode.NodeTypeName]: ToggleEditorNode,
  [WindowReminderNode.NodeTypeName]: WindowReminderEditorNode,
};

let type: string;
for (type in nodes) {
  RED.nodes.registerType(type, nodes[type]);
}
