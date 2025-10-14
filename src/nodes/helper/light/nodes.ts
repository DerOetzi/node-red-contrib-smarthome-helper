import { NodeRegistryEntry } from "nodes/types";
import LightControllerNode from "./light-controller";
import LightControllerEditorNode from "./light-controller/editor";

export const HelperLightNodesRegistry: { [key: string]: NodeRegistryEntry } = {
  [LightControllerNode.NodeTypeName]: {
    node: LightControllerNode,
    editor: LightControllerEditorNode,
  },
};
