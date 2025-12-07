import { NodeRegistryEntry } from "../../types";
import DehumidifierControllerNode from "./dehumidifier-controller";
import DehumidifierControllerEditorNode from "./dehumidifier-controller/editor";
import HeatingControllerNode from "./heating-controller";
import HeatingControllerEditorNode from "./heating-controller/editor";
import HygroCalculatorNode from "./hygro-calculator";
import HygroCalculatorEditorNode from "./hygro-calculator/editor";

export const HelperClimateNodesRegistry: { [key: string]: NodeRegistryEntry } =
  {
    [DehumidifierControllerNode.NodeTypeName]: {
      node: DehumidifierControllerNode,
      editor: DehumidifierControllerEditorNode,
    },
    [HeatingControllerNode.NodeTypeName]: {
      node: HeatingControllerNode,
      editor: HeatingControllerEditorNode,
    },
    [HygroCalculatorNode.NodeTypeName]: {
      node: HygroCalculatorNode,
      editor: HygroCalculatorEditorNode,
    },
  };
