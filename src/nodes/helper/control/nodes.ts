import { NodeRegistryEntry } from "nodes/types";
import EventMapperNode from "./event-mapper";
import EventMapperEditorNode from "./event-mapper/editor";
import MotionControllerNode from "./motion-controller";
import MotionControllerEditorNode from "./motion-controller/editor";

export const HelperControlNodesRegistry: { [key: string]: NodeRegistryEntry } =
  {
    [EventMapperNode.NodeTypeName]: {
      node: EventMapperNode,
      editor: EventMapperEditorNode,
    },
    [MotionControllerNode.NodeTypeName]: {
      node: MotionControllerNode,
      editor: MotionControllerEditorNode,
    },
  };
