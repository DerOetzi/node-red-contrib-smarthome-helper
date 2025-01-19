import { EditorRED } from "node-red";
import AutomationGateNode from "./nodes/flowctrl/automation-gate";
import AutomationGateEditorNode from "./nodes/flowctrl/automation-gate/editor";
import BaseNode from "./nodes/flowctrl/base";
import BaseEditorNode from "./nodes/flowctrl/base/editor";
import GateControlNode from "./nodes/flowctrl/gate-control";
import GateControlEditorNode from "./nodes/flowctrl/gate-control/editor";
import MatchJoinNode from "./nodes/flowctrl/match-join";
import MatchJoinEditorNode from "./nodes/flowctrl/match-join/editor";
import EventMapperNode from "./nodes/helper/event-mapper";
import EventMapperEditorNode from "./nodes/helper/event-mapper/editor";
import HeatingControllerNode from "./nodes/helper/heating-controller";
import HeatingControllerEditorNode from "./nodes/helper/heating-controller/editor";
import LightControllerNode from "./nodes/helper/light-controller";
import LightControllerEditorNode from "./nodes/helper/light-controller/editor";
import MotionControllerNode from "./nodes/helper/motion-controller";
import MotionControllerEditorNode from "./nodes/helper/motion-controller/editor";
import NotifyDispatcherNode from "./nodes/helper/notify-dispatcher";
import NotifyDispatcherEditorNode from "./nodes/helper/notify-dispatcher/editor";
import WindowReminderNode from "./nodes/helper/window-reminder";
import WindowReminderEditorNode from "./nodes/helper/window-reminder/editor";
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
  [ArithmeticNode.nodeTypeName]: ArithmeticEditorNode,
  [AutomationGateNode.nodeTypeName]: AutomationGateEditorNode,
  [BaseNode.nodeTypeName]: BaseEditorNode,
  [CompareNode.nodeTypeName]: CompareEditorNode,
  [EventMapperNode.nodeTypeName]: EventMapperEditorNode,
  [GateControlNode.nodeTypeName]: GateControlEditorNode,
  [HeatingControllerNode.nodeTypeName]: HeatingControllerEditorNode,
  [LightControllerNode.nodeTypeName]: LightControllerEditorNode,
  [LogicalOpNode.nodeTypeName]: LogicalOpEditorNode,
  [MatchJoinNode.nodeTypeName]: MatchJoinEditorNode,
  [MotionControllerNode.nodeTypeName]: MotionControllerEditorNode,
  [NotifyDispatcherNode.nodeTypeName]: NotifyDispatcherEditorNode,
  [SwitchNode.nodeTypeName]: SwitchEditorNode,
  [ToggleNode.nodeTypeName]: ToggleEditorNode,
  [WindowReminderNode.nodeTypeName]: WindowReminderEditorNode,
};

let type: string;
for (type in nodes) {
  RED.nodes.registerType(type, nodes[type]);
}
