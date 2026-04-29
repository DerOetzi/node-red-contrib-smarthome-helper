import { NodeRegistryEntry } from "../../types";
import LightControllerNode from "./light-controller";
import LightControllerEditorNode from "./light-controller/editor";

const LightControllerEditorMetadata: NodeRegistryEntry["metadata"] = {
  localePrefix: "helper.light-controller",
  inputMode: "matcher-topic",
  fieldKeys: [
    "identifier",
    "lightbulbType",
    "homeAssistantOutput",
    "onBrightness",
    "transitionTime",
    "colorTemperature",
    "nightmodeBrightness",
    "colorCycle",
    "fixColorHue",
    "fixColorSaturation",
    "onCommand",
    "offCommand",
    "nightmodeCommand",
  ],
  inputKeys: ["command", "colorTemperature", "hue", "saturation"],
  outputKeys: ["command"],
};

export const HelperLightNodesRegistry: { [key: string]: NodeRegistryEntry } = {
  [LightControllerNode.NodeTypeName]: {
    node: LightControllerNode,
    editor: LightControllerEditorNode,
    metadata: LightControllerEditorMetadata,
  },
};
