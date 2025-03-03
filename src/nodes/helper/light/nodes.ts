import LightControllerNode from "./light-controller";
import LightControllerEditorNode from "./light-controller/editor";

export const HelperLightNodes = [LightControllerNode];

export const HelperLightEditorNodes = {
  [LightControllerNode.NodeTypeName]: LightControllerEditorNode,
};
