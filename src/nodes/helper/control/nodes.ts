import EventMapperNode from "./event-mapper";
import EventMapperEditorNode from "./event-mapper/editor";
import MotionControllerNode from "./motion-controller";
import MotionControllerEditorNode from "./motion-controller/editor";

export const HelperControlNodes = [EventMapperNode, MotionControllerNode];

export const HelperControlEditorNodes = {
  [EventMapperNode.NodeTypeName]: EventMapperEditorNode,
  [MotionControllerNode.NodeTypeName]: MotionControllerEditorNode,
};
