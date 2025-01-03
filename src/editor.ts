import { EditorRED } from "node-red";
import AutomationGateNode from "./nodes/flowctrl/automation-gate";
import AutomationGateNodeEditor from "./nodes/flowctrl/automation-gate/editor";
import BaseNode from "./nodes/flowctrl/base";
import BaseNodeEditor from "./nodes/flowctrl/base/editor";
import GateControlNode from "./nodes/flowctrl/gate-control";
import GateControlNodeEditor from "./nodes/flowctrl/gate-control/editor";
import MatchJoinNode from "./nodes/flowctrl/match-join";
import MatchJoinNodeEditor from "./nodes/flowctrl/match-join/editor";

declare const RED: EditorRED;

const nodes: Record<string, any> = {
  [AutomationGateNode.nodeTypeName]: AutomationGateNodeEditor,
  [BaseNode.nodeTypeName]: BaseNodeEditor,
  [GateControlNode.nodeTypeName]: GateControlNodeEditor,
  [MatchJoinNode.nodeTypeName]: MatchJoinNodeEditor,
};

let type: string;
for (type in nodes) {
  RED.nodes.registerType(type, nodes[type]);
}
