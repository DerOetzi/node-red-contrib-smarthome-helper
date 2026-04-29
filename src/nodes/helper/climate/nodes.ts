import { NodeRegistryEntry } from "../../types";
import HeatingControllerNode from "./heating-controller";
import HeatingControllerEditorNode, {
  HeatingControllerEditorMetadata,
} from "./heating-controller/editor";
import HygroCalculatorNode from "./hygro-calculator";
import HygroCalculatorEditorNode, {
  HygroCalculatorEditorMetadata,
} from "./hygro-calculator/editor";

export const HelperClimateNodesRegistry: { [key: string]: NodeRegistryEntry } =
  {
    [HeatingControllerNode.NodeTypeName]: {
      node: HeatingControllerNode,
      editor: HeatingControllerEditorNode,
      metadata: HeatingControllerEditorMetadata,
    },
    [HygroCalculatorNode.NodeTypeName]: {
      node: HygroCalculatorNode,
      editor: HygroCalculatorEditorNode,
      metadata: HygroCalculatorEditorMetadata,
    },
  };
