import ArithmeticNode from "./arithmetic";
import ArithmeticEditorNode from "./arithmetic/editor";

export const OperatorNodes = [ArithmeticNode];

export const OperatorEditorNodes = {
  [ArithmeticNode.NodeTypeName]: ArithmeticEditorNode,
};
