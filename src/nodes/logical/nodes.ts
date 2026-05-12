import { NodeRegistryEntry } from "../types";
import CompareNode from "./compare";
import CompareEditorNode, {
  CompareEditorMetadata,
  CompareEditorTemplate,
} from "./compare/editor";
import HysteresisSwitchNode from "./hysteresis-switch";
import HysteresisSwitchEditorNode, {
  HysteresisSwitchEditorMetadata,
  HysteresisSwitchEditorTemplate,
} from "./hysteresis-switch/editor";
import LogicalOpNode from "./op";
import LogicalOpEditorNode, {
  LogicalOpEditorMetadata,
  LogicalOpEditorTemplate,
} from "./op/editor";
import SwitchNode from "./switch";
import SwitchEditorNode, {
  SwitchEditorMetadata,
  SwitchEditorTemplate,
} from "./switch/editor";
import ToogleNode from "./toggle";
import ToggleEditorNode, { ToggleEditorMetadata } from "./toggle/editor";

export const LogicalNodesRegistry: { [key: string]: NodeRegistryEntry } = {
  [CompareNode.NodeTypeName]: {
    node: CompareNode,
    editor: CompareEditorNode,
    metadata: CompareEditorMetadata,
    template: CompareEditorTemplate,
  },
  [HysteresisSwitchNode.NodeTypeName]: {
    node: HysteresisSwitchNode,
    editor: HysteresisSwitchEditorNode,
    metadata: HysteresisSwitchEditorMetadata,
    template: HysteresisSwitchEditorTemplate,
  },
  [LogicalOpNode.NodeTypeName]: {
    node: LogicalOpNode,
    editor: LogicalOpEditorNode,
    metadata: LogicalOpEditorMetadata,
    template: LogicalOpEditorTemplate,
  },
  [SwitchNode.NodeTypeName]: {
    node: SwitchNode,
    editor: SwitchEditorNode,
    metadata: SwitchEditorMetadata,
    template: SwitchEditorTemplate,
  },
  [ToogleNode.NodeTypeName]: {
    node: ToogleNode,
    editor: ToggleEditorNode,
    metadata: ToggleEditorMetadata,
    template: SwitchEditorTemplate,
  },
};
