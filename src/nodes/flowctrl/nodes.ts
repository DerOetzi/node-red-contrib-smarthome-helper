import { NodeEditorDefinition } from "./base/editor";
import { AutomationGateEditorDef } from "./automation-gate/editor";
import { GateControlEditorDef } from "./gate-control/editor";
import { MatchJoinEditorDef } from "./match-join/editor";
import { StatusEditorDef } from "./status/editor";

export const FlowCtrlDefs: NodeEditorDefinition<any, any>[] = [
  AutomationGateEditorDef,
  GateControlEditorDef,
  MatchJoinEditorDef,
  StatusEditorDef,
];

// BaseNode is a special case - not included in defs array
export { default as FlowCtrlBaseNode } from "./base";
export {
  default as FlowCtrlBaseEditorNode,
  BaseEditorTemplate as FlowCtrlBaseEditorTemplate,
  BaseEditorMetadata as FlowCtrlBaseEditorMetadata,
} from "./base/editor";
