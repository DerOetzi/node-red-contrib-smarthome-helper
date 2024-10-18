import { NodeAPI } from "node-red";
import { NodeType } from "./const";
import AutomationGate from "./nodes/flow_control/automation-gate";
import { setRED } from "./globals";
import GateControl from "./nodes/flow_control/gate-control";
import version from "./version";

const nodes: Record<NodeType, any> = {
  [NodeType.AutomationGate]: AutomationGate,
  [NodeType.GateControl]: GateControl,
};

export default async (RED: NodeAPI): Promise<void> => {
  console.log("Registering nodes");
  setRED(RED);
  let type: NodeType;
  for (type in nodes) {
    RED.nodes.registerType(type, nodes[type]);
  }

  RED.log.info(
    `@deroetzi/node-red-contrib-smarthome-helper v${version} nodes initialized`
  );
};
