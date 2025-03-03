import CompareNode from "./compare";
import CompareEditorNode from "./compare/editor";
import LogicalOpNode from "./op";
import LogicalOpEditorNode from "./op/editor";
import SwitchNode from "./switch";
import SwitchEditorNode from "./switch/editor";
import ToogleNode from "./toggle";
import ToggleEditorNode from "./toggle/editor";

export const LogicalNodes = [
  CompareNode,
  LogicalOpNode,
  SwitchNode,
  ToogleNode,
];

export const LogicalEditorNodes = {
  [CompareNode.NodeTypeName]: CompareEditorNode,
  [LogicalOpNode.NodeTypeName]: LogicalOpEditorNode,
  [SwitchNode.NodeTypeName]: SwitchEditorNode,
  [ToogleNode.NodeTypeName]: ToggleEditorNode,
};
