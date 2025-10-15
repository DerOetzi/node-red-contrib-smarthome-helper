import { NodeRegistryEntry } from "../types";
import ArithmeticNode from "./arithmetic";
import ArithmeticEditorNode from "./arithmetic/editor";

export const OperatorNodesRegistry: { [key: string]: NodeRegistryEntry } = {
  [ArithmeticNode.NodeTypeName]: {
    node: ArithmeticNode,
    editor: ArithmeticEditorNode,
  },
};
