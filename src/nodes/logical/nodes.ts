import { NodeRegistryEntry } from "../types";
import CompareNode from "./compare";
import CompareEditorNode, { CompareEditorMetadata } from "./compare/editor";
import HysteresisSwitchNode from "./hysteresis-switch";
import HysteresisSwitchEditorNode, {
  HysteresisSwitchEditorMetadata,
} from "./hysteresis-switch/editor";
import LogicalOpNode from "./op";
import LogicalOpEditorNode, { LogicalOpEditorMetadata } from "./op/editor";
import SwitchNode from "./switch";
import SwitchEditorNode, { SwitchEditorMetadata } from "./switch/editor";
import ToogleNode from "./toggle";
import ToggleEditorNode, { ToggleEditorMetadata } from "./toggle/editor";

export const LogicalNodesRegistry: { [key: string]: NodeRegistryEntry } = {
  [CompareNode.NodeTypeName]: {
    node: CompareNode,
    editor: CompareEditorNode,
    metadata: CompareEditorMetadata,
  },
  [HysteresisSwitchNode.NodeTypeName]: {
    node: HysteresisSwitchNode,
    editor: HysteresisSwitchEditorNode,
    metadata: HysteresisSwitchEditorMetadata,
  },
  [LogicalOpNode.NodeTypeName]: {
    node: LogicalOpNode,
    editor: LogicalOpEditorNode,
    metadata: LogicalOpEditorMetadata,
  },
  [SwitchNode.NodeTypeName]: {
    node: SwitchNode,
    editor: SwitchEditorNode,
    metadata: SwitchEditorMetadata,
  },
  [ToogleNode.NodeTypeName]: {
    node: ToogleNode,
    editor: ToggleEditorNode,
    metadata: ToggleEditorMetadata,
  },
};
