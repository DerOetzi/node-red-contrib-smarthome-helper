import { Node, NodeAPI } from "node-red";
import AutomationGateNode from "./nodes/flowctrl/automation-gate";
import BaseNode from "./nodes/flowctrl/base";
import GateControlNode from "./nodes/flowctrl/gate-control";
import MatchJoinNode from "./nodes/flowctrl/match-join";
import EventMapperNode from "./nodes/helper/event-mapper";
import HeatingControllerNode from "./nodes/helper/heating-controller";
import LightControllerNode from "./nodes/helper/light-controller";
import MotionControllerNode from "./nodes/helper/motion-controller";
import NotifyDispatcherNode from "./nodes/helper/notify-dispatcher";
import WindowReminderNode from "./nodes/helper/window-reminder";
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
