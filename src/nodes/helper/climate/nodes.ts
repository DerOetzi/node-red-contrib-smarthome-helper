import HeatingControllerNode from "./heating-controller";
import HeatingControllerEditorNode from "./heating-controller/editor";

export const HelperClimateNodes = [HeatingControllerNode];

export const HelperClimateEditorNodes = {
  [HeatingControllerNode.NodeTypeName]: HeatingControllerEditorNode,
};
