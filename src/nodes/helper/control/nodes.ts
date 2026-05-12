import { NodeRegistryEntry } from "../../types";
import EventMapperNode from "./event-mapper";
import EventMapperEditorNode, {
  EventMapperEditorMetadata,
  EventMapperEditorTemplate,
} from "./event-mapper/editor";
import MotionControllerNode from "./motion-controller";
import MotionControllerEditorNode, {
  MotionControllerEditorMetadata,
  MotionControllerEditorTemplate,
} from "./motion-controller/editor";

export const HelperControlNodesRegistry: { [key: string]: NodeRegistryEntry } =
  {
    [EventMapperNode.NodeTypeName]: {
      node: EventMapperNode,
      editor: EventMapperEditorNode,
      metadata: EventMapperEditorMetadata,
      template: EventMapperEditorTemplate,
    },
    [MotionControllerNode.NodeTypeName]: {
      node: MotionControllerNode,
      editor: MotionControllerEditorNode,
      metadata: MotionControllerEditorMetadata,
      template: MotionControllerEditorTemplate,
    },
  };
