import { Node, NodeAPI } from "node-red";
import AutomationGateNode from "./nodes/flowctrl/automation-gate";
import BaseNode from "./nodes/flowctrl/base";
import GateControlNode from "./nodes/flowctrl/gate-control";
import MatchJoinNode from "./nodes/flowctrl/match-join";
import HeatingControllerNode from "./nodes/helper/climate/heating-controller";
import EventMapperNode from "./nodes/helper/control/event-mapper";
import MotionControllerNode from "./nodes/helper/control/motion-controller";
import LightControllerNode from "./nodes/helper/light/light-controller";
import NotifyDispatcherNode from "./nodes/helper/notification/notify-dispatcher";
import WhitegoodReminderNode from "./nodes/helper/notification/whitegood-reminder";
import WindowReminderNode from "./nodes/helper/notification/window-reminder";
import CompareNode from "./nodes/logical/compare";
import LogicalOpNode from "./nodes/logical/op";
import SwitchNode from "./nodes/logical/switch";
import ToggleNode from "./nodes/logical/toggle";
import ArithmeticNode from "./nodes/operator/arithmetic";
import version from "./version";

const nodes = [
  ArithmeticNode,
  AutomationGateNode,
  BaseNode,
  CompareNode,
  EventMapperNode,
  GateControlNode,
  HeatingControllerNode,
  LightControllerNode,
  LogicalOpNode,
  MatchJoinNode,
  MotionControllerNode,
  NotifyDispatcherNode,
  SwitchNode,
  ToggleNode,
  WhitegoodReminderNode,
  WindowReminderNode,
];

export default async (RED: NodeAPI): Promise<void> => {
  for (const NodeClass of nodes) {
    RED.log.info(
      `Registering node type ${NodeClass.NodeTypeName} for @deroetzi/node-red-contrib-smarthome-helper`
    );

    RED.nodes.registerType(
      NodeClass.NodeTypeName,
      function (this: Node, config: any) {
        RED.nodes.createNode(this, config);
        const node = this;
        const nodeController = new (NodeClass as any)(RED, node, config);
        nodeController.registerListenerAndInitialize();
      }
    );
  }

  RED.log.info(
    `@deroetzi/node-red-contrib-smarthome-helper v${version} nodes initialized`
  );
};
