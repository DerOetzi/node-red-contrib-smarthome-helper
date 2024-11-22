import { NodeAPI } from "node-red";
import { setRED } from "./globals";
import AutomationGateNode from "./nodes/flowctrl/automation-gate";
import BaseNode from "./nodes/flowctrl/base";
import GateControlNode from "./nodes/flowctrl/gate-control";
import MatchJoinNode from "./nodes/flowctrl/match-join";
import HeatModeSelectNode from "./nodes/helper/heatmode-select";
import LightControllerNode from "./nodes/helper/light-controller";
import NotifyDispatcherNode from "./nodes/helper/notify-dispatcher";
import WindowReminderNode from "./nodes/helper/window-reminder";
import CompareNode from "./nodes/logical/compare";
import LogicalOpNode from "./nodes/logical/op";
import SwitchNode from "./nodes/logical/switch";
import version from "./version";

const nodes = [
  AutomationGateNode,
  BaseNode,
  CompareNode,
  HeatModeSelectNode,
  LightControllerNode,
  LogicalOpNode,
  GateControlNode,
  MatchJoinNode,
  NotifyDispatcherNode,
  SwitchNode,
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
