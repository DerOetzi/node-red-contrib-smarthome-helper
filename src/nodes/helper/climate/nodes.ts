import HeatingControllerNode from "./heating-controller";
import HeatingControllerEditorNode from "./heating-controller/editor";
import HygroCalculatorNode from "./hygro-calculator";
import HygroCalculatorEditorNode from "./hygro-calculator/editor";

export const HelperClimateNodes = [HeatingControllerNode, HygroCalculatorNode];

export const HelperClimateEditorNodes = {
  [HeatingControllerNode.NodeTypeName]: HeatingControllerEditorNode,
  [HygroCalculatorNode.NodeTypeName]: HygroCalculatorEditorNode,
};
