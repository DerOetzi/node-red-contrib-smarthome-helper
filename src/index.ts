import { NodeAPI } from "node-red";
import { setRED } from "./globals";
import AutomationGateNode from "./nodes/flowctrl/automation-gate";
import BaseNode from "./nodes/flowctrl/base";
import GateControlNode from "./nodes/flowctrl/gate-control";
import MatchJoinNode from "./nodes/flowctrl/match-join";
import EventMapperNode from "./nodes/helper/event-mapper";
import HeatModeSelectNode from "./nodes/helper/heatmode-select";
import LightControllerNode from "./nodes/helper/light-controller";
import MotionControllerNode from "./nodes/helper/motion-controller";
import NotifyDispatcherNode from "./nodes/helper/notify-dispatcher";
import WindowReminderNode from "./nodes/helper/window-reminder";
import CompareNode from "./nodes/logical/compare";
import LogicalOpNode from "./nodes/logical/op";
import SwitchNode from "./nodes/logical/switch";
import ToggleNode from "./nodes/logical/toggle";
import version from "./version";

const nodes = [
  AutomationGateNode,
  BaseNode,
  CompareNode,
  EventMapperNode,
  HeatModeSelectNode,
  LightControllerNode,
  LogicalOpNode,
  GateControlNode,
  MatchJoinNode,
  MotionControllerNode,
  NotifyDispatcherNode,
  SwitchNode,
  ToggleNode,
  WindowReminderNode,
];

export default async (RED: NodeAPI): Promise<void> => {
  setRED(RED);
  for (const NodeClass of nodes) {
    RED.log.info(
      `Registering node type ${NodeClass.type.fullName} for @deroetzi/node-red-contrib-smarthome-helper`
    );
    RED.nodes.registerType(NodeClass.type.fullName, NodeClass.createFunction());
  }

  RED.log.info(
    `@deroetzi/node-red-contrib-smarthome-helper v${version} nodes initialized`
  );
};
