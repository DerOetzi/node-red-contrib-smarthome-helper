import { NodeRegistryEntry } from "../../types";
import HeatingControllerNode from "./heating-controller";
import HeatingControllerEditorNode from "./heating-controller/editor";
import HygroCalculatorNode from "./hygro-calculator";
import HygroCalculatorEditorNode from "./hygro-calculator/editor";

export const HelperClimateNodesRegistry: { [key: string]: NodeRegistryEntry } =
  {
    [HeatingControllerNode.NodeTypeName]: {
      node: HeatingControllerNode,
      editor: HeatingControllerEditorNode,
    },
    [HygroCalculatorNode.NodeTypeName]: {
      node: HygroCalculatorNode,
      editor: HygroCalculatorEditorNode,
    },
  };
