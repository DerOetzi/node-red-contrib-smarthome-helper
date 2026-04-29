import { NodeRegistryEntry } from "../../types";
import EventMapperNode from "./event-mapper";
import EventMapperEditorNode, {
  EventMapperEditorMetadata,
} from "./event-mapper/editor";
import MotionControllerNode from "./motion-controller";
import MotionControllerEditorNode, {
  MotionControllerEditorMetadata,
} from "./motion-controller/editor";

export const HelperControlNodesRegistry: { [key: string]: NodeRegistryEntry } =
  {
    [EventMapperNode.NodeTypeName]: {
      node: EventMapperNode,
      editor: EventMapperEditorNode,
      metadata: EventMapperEditorMetadata,
    },
    [MotionControllerNode.NodeTypeName]: {
      node: MotionControllerNode,
      editor: MotionControllerEditorNode,
      metadata: MotionControllerEditorMetadata,
    },
  };
