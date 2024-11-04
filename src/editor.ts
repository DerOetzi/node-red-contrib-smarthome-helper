import { EditorRED } from "node-red";
import AutomationGateNodeEditor, {
  AutomationGateNodeType,
} from "./nodes/flowctrl/automation-gate/editor";
import BaseNodeEditor, { BaseNodeType } from "./nodes/flowctrl/base/editor";
import GateControlNodeEditor, {
  GateControlNodeType,
} from "./nodes/flowctrl/gate-control/editor";
import MatchJoinNodeEditor, {
  MatchJoinNodeType,
} from "./nodes/flowctrl/match-join/editor";
import CompareNodeEditor, {
  CompareNodeType,
} from "./nodes/logical/compare/editor";
import LogicalOpNodeEditor, {
  LogicalOpNodeType,
} from "./nodes/logical/op/editor";
import SwitchNodeEditor from "./nodes/logical/switch/editor";
import { SwitchNodeType } from "./nodes/logical/switch/types";

declare const RED: EditorRED;

const nodes: Record<string, any> = {
  [BaseNodeType.fullName]: BaseNodeEditor,
  [AutomationGateNodeType.fullName]: AutomationGateNodeEditor,
  [GateControlNodeType.fullName]: GateControlNodeEditor,
  [MatchJoinNodeType.fullName]: MatchJoinNodeEditor,
  [CompareNodeType.fullName]: CompareNodeEditor,
  [LogicalOpNodeType.fullName]: LogicalOpNodeEditor,
  [SwitchNodeType.fullName]: SwitchNodeEditor,
};

let type: string;
for (type in nodes) {
  RED.nodes.registerType(type, nodes[type]);
}
