import AutomationGateNode from "./automation-gate";
import AutomationGateEditorNode from "./automation-gate/editor";
import BaseNode from "./base";
import BaseEditorNode from "./base/editor";
import GateControlNode from "./gate-control";
import GateControlEditorNode from "./gate-control/editor";
import MatchJoinNode from "./match-join";
import MatchJoinEditorNode from "./match-join/editor";
import StatusNode from "./status";
import StatusEditorNode from "./status/editor";

export const FlowCtrlNodes = [
  AutomationGateNode,
  BaseNode,
  GateControlNode,
  MatchJoinNode,
  StatusNode,
];

export const FlowCtrlEditorNodes = {
  [AutomationGateNode.NodeTypeName]: AutomationGateEditorNode,
  [BaseNode.NodeTypeName]: BaseEditorNode,
  [GateControlNode.NodeTypeName]: GateControlEditorNode,
  [MatchJoinNode.NodeTypeName]: MatchJoinEditorNode,
  [StatusNode.NodeTypeName]: StatusEditorNode,
};
