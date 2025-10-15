import { NodeRegistryEntry } from "../types";
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

export const FlowCtrlNodesRegistry: { [key: string]: NodeRegistryEntry } = {
  [AutomationGateNode.NodeTypeName]: {
    node: AutomationGateNode,
    editor: AutomationGateEditorNode,
  },
  [BaseNode.NodeTypeName]: {
    node: BaseNode,
    editor: BaseEditorNode,
  },
  [GateControlNode.NodeTypeName]: {
    node: GateControlNode,
    editor: GateControlEditorNode,
  },
  [MatchJoinNode.NodeTypeName]: {
    node: MatchJoinNode,
    editor: MatchJoinEditorNode,
  },
  [StatusNode.NodeTypeName]: {
    node: StatusNode,
    editor: StatusEditorNode,
  },
};
