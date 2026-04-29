import { NodeRegistryEntry } from "../types";
import AutomationGateNode from "./automation-gate";
import AutomationGateEditorNode, {
  AutomationGateEditorMetadata,
} from "./automation-gate/editor";
import BaseNode from "./base";
import BaseEditorNode, { BaseEditorMetadata } from "./base/editor";
import GateControlNode from "./gate-control";
import GateControlEditorNode, {
  GateControlEditorMetadata,
} from "./gate-control/editor";
import MatchJoinNode from "./match-join";
import MatchJoinEditorNode, {
  MatchJoinEditorMetadata,
} from "./match-join/editor";
import StatusNode from "./status";
import StatusEditorNode, { StatusEditorMetadata } from "./status/editor";

export const FlowCtrlNodesRegistry: { [key: string]: NodeRegistryEntry } = {
  [AutomationGateNode.NodeTypeName]: {
    node: AutomationGateNode,
    editor: AutomationGateEditorNode,
    metadata: AutomationGateEditorMetadata,
  },
  [BaseNode.NodeTypeName]: {
    node: BaseNode,
    editor: BaseEditorNode,
    metadata: BaseEditorMetadata,
  },
  [GateControlNode.NodeTypeName]: {
    node: GateControlNode,
    editor: GateControlEditorNode,
    metadata: GateControlEditorMetadata,
  },
  [MatchJoinNode.NodeTypeName]: {
    node: MatchJoinNode,
    editor: MatchJoinEditorNode,
    metadata: MatchJoinEditorMetadata,
  },
  [StatusNode.NodeTypeName]: {
    node: StatusNode,
    editor: StatusEditorNode,
    metadata: StatusEditorMetadata,
  },
};
