import BaseNode from "@base";
import BaseEditorNode from "@base/editor";
import AutomationGateNode from "./automation-gate";
import AutomationGateEditorNode from "./automation-gate/editor";
import GateControlNode from "./gate-control";
import GateControlEditorNode from "./gate-control/editor";
import MatchJoinNode from "./match-join";
import MatchJoinEditorNode from "./match-join/editor";

export const FlowCtrlNodes = [
  AutomationGateNode,
  BaseNode,
  GateControlNode,
  MatchJoinNode,
];

export const FlowCtrlEditorNodes = {
  [AutomationGateNode.NodeTypeName]: AutomationGateEditorNode,
  [BaseNode.NodeTypeName]: BaseEditorNode,
  [GateControlNode.NodeTypeName]: GateControlEditorNode,
  [MatchJoinNode.NodeTypeName]: MatchJoinEditorNode,
};
