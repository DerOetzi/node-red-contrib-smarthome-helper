import { NodeRegistryEntry } from "../types";
import ArithmeticNode from "./arithmetic";
import ArithmeticEditorNode from "./arithmetic/editor";

const ArithmeticEditorMetadata: NodeRegistryEntry["metadata"] = {
  localePrefix: "operator.arithmetic",
  inputMode: "msg-property",
  fieldKeys: ["minValueCount", "operation", "precision", "additionalValue"],
  inputKeys: ["value", "minuend"],
  outputKeys: ["result"],
};

export const OperatorNodesRegistry: { [key: string]: NodeRegistryEntry } = {
  [ArithmeticNode.NodeTypeName]: {
    node: ArithmeticNode,
    editor: ArithmeticEditorNode,
    metadata: ArithmeticEditorMetadata,
  },
};
