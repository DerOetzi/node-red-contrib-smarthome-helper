import { NodeRegistryEntry } from "../../types";
import EventMapperNode from "./event-mapper";
import EventMapperEditorNode from "./event-mapper/editor";
import MotionControllerNode from "./motion-controller";
import MotionControllerEditorNode from "./motion-controller/editor";

const EventMapperEditorMetadata: NodeRegistryEntry["metadata"] = {
  localePrefix: "helper.event-mapper",
  inputMode: "matcher-topic",
  fieldKeys: ["event", "mapped", "ignoreUnknownEvents"],
  inputKeys: ["event"],
  outputKeys: ["event"],
};

const MotionControllerEditorMetadata: NodeRegistryEntry["metadata"] = {
  localePrefix: "helper.motion-controller",
  inputMode: "matcher-topic",
  fieldKeys: ["timer", "onlyDarkness", "nightmodeEnabled"],
  inputKeys: ["motion", "darkness", "night", "manualControl", "command"],
  outputKeys: ["action", "status"],
};

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
