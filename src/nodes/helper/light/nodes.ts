import { NodeRegistryEntry } from "../../types";
import LightControllerNode from "./light-controller";
import LightControllerEditorNode, {
  LightControllerEditorMetadata,
} from "./light-controller/editor";

export const HelperLightNodesRegistry: { [key: string]: NodeRegistryEntry } = {
  [LightControllerNode.NodeTypeName]: {
    node: LightControllerNode,
    editor: LightControllerEditorNode,
    metadata: LightControllerEditorMetadata,
  },
};
