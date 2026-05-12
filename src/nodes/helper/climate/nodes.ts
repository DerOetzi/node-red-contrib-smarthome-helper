import { NodeRegistryEntry } from "../../types";
import HeatingControllerNode from "./heating-controller";
import HeatingControllerEditorNode, {
  HeatingControllerEditorMetadata,
  HeatingControllerEditorTemplate,
} from "./heating-controller/editor";
import HygroCalculatorNode from "./hygro-calculator";
import HygroCalculatorEditorNode, {
  HygroCalculatorEditorMetadata,
  HygroCalculatorEditorTemplate,
} from "./hygro-calculator/editor";
import WarmWaterPVControllerNode from "./warmwater-pv-controller";
import WarmWaterPVControllerEditorNode, {
  WarmWaterPVControllerEditorMetadata,
  WarmWaterPVControllerEditorTemplate,
} from "./warmwater-pv-controller/editor";

export const HelperClimateNodesRegistry: { [key: string]: NodeRegistryEntry } =
  {
    [HeatingControllerNode.NodeTypeName]: {
      node: HeatingControllerNode,
      editor: HeatingControllerEditorNode,
      metadata: HeatingControllerEditorMetadata,
      template: HeatingControllerEditorTemplate,
    },
    [HygroCalculatorNode.NodeTypeName]: {
      node: HygroCalculatorNode,
      editor: HygroCalculatorEditorNode,
      metadata: HygroCalculatorEditorMetadata,
      template: HygroCalculatorEditorTemplate,
    },
    [WarmWaterPVControllerNode.NodeTypeName]: {
      node: WarmWaterPVControllerNode,
      editor: WarmWaterPVControllerEditorNode,
      metadata: WarmWaterPVControllerEditorMetadata,
      template: WarmWaterPVControllerEditorTemplate,
    },
  };
