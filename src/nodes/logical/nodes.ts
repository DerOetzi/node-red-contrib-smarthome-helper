import { NodeRegistryEntry } from "../types";
import CompareNode from "./compare";
import CompareEditorNode from "./compare/editor";
import HysteresisSwitchNode from "./hysteresis-switch";
import HysteresisSwitchEditorNode from "./hysteresis-switch/editor";
import LogicalOpNode from "./op";
import LogicalOpEditorNode from "./op/editor";
import SwitchNode from "./switch";
import SwitchEditorNode from "./switch/editor";
import ToogleNode from "./toggle";
import ToggleEditorNode from "./toggle/editor";

export const LogicalNodesRegistry: { [key: string]: NodeRegistryEntry } = {
  [CompareNode.NodeTypeName]: {
    node: CompareNode,
    editor: CompareEditorNode,
  },
  [HysteresisSwitchNode.NodeTypeName]: {
    node: HysteresisSwitchNode,
    editor: HysteresisSwitchEditorNode,
  },
  [LogicalOpNode.NodeTypeName]: {
    node: LogicalOpNode,
    editor: LogicalOpEditorNode,
  },
  [SwitchNode.NodeTypeName]: {
    node: SwitchNode,
    editor: SwitchEditorNode,
  },
  [ToogleNode.NodeTypeName]: {
    node: ToogleNode,
    editor: ToggleEditorNode,
  },
};
