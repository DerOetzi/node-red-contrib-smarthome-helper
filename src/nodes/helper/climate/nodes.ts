import { NodeRegistryEntry } from "../../types";
import DehumidifierControllerNode from "./dehumidifier-controller";
import DehumidifierControllerEditorNode from "./dehumidifier-controller/editor";
import HeatingControllerNode from "./heating-controller";
import HeatingControllerEditorNode from "./heating-controller/editor";
import HygroCalculatorNode from "./hygro-calculator";
import HygroCalculatorEditorNode from "./hygro-calculator/editor";

const DehumidifierControllerEditorMetadata: NodeRegistryEntry["metadata"] = {
  localePrefix: "helper.dehumidifier-controller",
  inputMode: "matcher-topic",
  fieldKeys: [
    "target",
    "minHumidity",
    "maxHumidity",
    "baseTarget",
    "minOnTime",
    "minOffTime",
  ],
  inputKeys: [
    "humidity",
    "temperature",
    "windowOpen",
    "compressorActive",
    "nightMode",
    "absenceMode",
  ],
  outputKeys: ["control"],
};

const HeatingControllerEditorMetadata: NodeRegistryEntry["metadata"] = {
  localePrefix: "helper.heating-controller",
  inputMode: "matcher-topic",
  fieldKeys: [
    "target",
    "reactivateEnabled",
    "pause",
    "defaultActive",
    "boostEnabled",
    "boostTemperatureOffset",
    "frostProtectionTemperature",
    "comfortCommand",
    "ecoCommand",
    "boostCommand",
    "frostProtectionCommand",
    "pvBoostEnabled",
    "pvBoostTemperatureOffset",
  ],
  inputKeys: [
    "activeCondition",
    "comfortTemperature",
    "ecoTemperatureOffset",
    "windowOpen",
    "manualControl",
    "command",
    "pvBoost",
    "pvBoostTemperatureOffset",
  ],
  outputKeys: ["heatmode", "temperature", "window", "status"],
};

const HygroCalculatorEditorMetadata: NodeRegistryEntry["metadata"] = {
  localePrefix: "helper.hygro-calculator",
  inputMode: "matcher-topic",
  fieldKeys: [],
  inputKeys: ["temperature", "humidity"],
  outputKeys: ["dewPoint", "absoluteHumidity"],
};

export const HelperClimateNodesRegistry: { [key: string]: NodeRegistryEntry } =
  {
    [DehumidifierControllerNode.NodeTypeName]: {
      node: DehumidifierControllerNode,
      editor: DehumidifierControllerEditorNode,
      metadata: DehumidifierControllerEditorMetadata,
    },
    [HeatingControllerNode.NodeTypeName]: {
      node: HeatingControllerNode,
      editor: HeatingControllerEditorNode,
      metadata: HeatingControllerEditorMetadata,
    },
    [HygroCalculatorNode.NodeTypeName]: {
      node: HygroCalculatorNode,
      editor: HygroCalculatorEditorNode,
      metadata: HygroCalculatorEditorMetadata,
    },
  };
