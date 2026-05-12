import { NodeRegistryEntry } from "../types";
import AutomationGateNode from "./automation-gate";
import AutomationGateEditorNode, {
  AutomationGateEditorMetadata,
  AutomationGateEditorTemplate,
} from "./automation-gate/editor";
import BaseNode from "./base";
import BaseEditorNode, {
  BaseEditorMetadata,
  BaseEditorTemplate,
} from "./base/editor";
import GateControlNode from "./gate-control";
import GateControlEditorNode, {
  GateControlEditorMetadata,
  GateControlEditorTemplate,
} from "./gate-control/editor";
import MatchJoinNode from "./match-join";
import MatchJoinEditorNode, {
  MatchJoinEditorMetadata,
  MatchJoinEditorTemplate,
} from "./match-join/editor";
import StatusNode from "./status";
import StatusEditorNode, {
  StatusEditorMetadata,
  StatusEditorTemplate,
} from "./status/editor";

export const FlowCtrlNodesRegistry: { [key: string]: NodeRegistryEntry } = {
  [AutomationGateNode.NodeTypeName]: {
    node: AutomationGateNode,
    editor: AutomationGateEditorNode,
    metadata: AutomationGateEditorMetadata,
    template: AutomationGateEditorTemplate,
  },
  [BaseNode.NodeTypeName]: {
    node: BaseNode,
    editor: BaseEditorNode,
    metadata: BaseEditorMetadata,
    template: BaseEditorTemplate,
  },
  [GateControlNode.NodeTypeName]: {
    node: GateControlNode,
    editor: GateControlEditorNode,
    metadata: GateControlEditorMetadata,
    template: GateControlEditorTemplate,
  },
  [MatchJoinNode.NodeTypeName]: {
    node: MatchJoinNode,
    editor: MatchJoinEditorNode,
    metadata: MatchJoinEditorMetadata,
    template: MatchJoinEditorTemplate,
  },
  [StatusNode.NodeTypeName]: {
    node: StatusNode,
    editor: StatusEditorNode,
    metadata: StatusEditorMetadata,
    template: StatusEditorTemplate,
  },
};
