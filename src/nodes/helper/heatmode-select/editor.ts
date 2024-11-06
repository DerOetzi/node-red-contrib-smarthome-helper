import { EditorNodeDef } from "node-red";
import {
  defaultHeatModeSelectNodeConfig,
  HeatModeSelectNodeEditorProperties,
  HeatModeSelectNodeType,
} from "./types";
import BaseNodeEditor from "../../flowctrl/base/editor";

const HeatModeSelectNodeEditor: EditorNodeDef<HeatModeSelectNodeEditorProperties> =
  {
    ...BaseNodeEditor,
    category: HeatModeSelectNodeType.categoryLabel,
    color: HeatModeSelectNodeType.color,
    defaults: {
      ...BaseNodeEditor.defaults,
      comfortMode: {
        value: defaultHeatModeSelectNodeConfig.comfortMode!,
        required: true,
      },
      ecoMode: {
        value: defaultHeatModeSelectNodeConfig.ecoMode!,
        required: true,
      },
      boostMode: {
        value: defaultHeatModeSelectNodeConfig.boostMode!,
        required: true,
      },
      frostProtectionMode: {
        value: defaultHeatModeSelectNodeConfig.frostProtectionMode!,
        required: true,
      },
      defaultComfortTemp: {
        value: defaultHeatModeSelectNodeConfig.defaultComfortTemp!,
        required: true,
      },
      defaultEcoTemp: {
        value: defaultHeatModeSelectNodeConfig.defaultEcoTemp!,
        required: true,
      },
    },
    outputs: 2,
    outputLabels: ["target temperature", "gate command"],
    icon: "switch.svg",
    label: function () {
      return this.name || HeatModeSelectNodeType.name;
    },
  };

export default HeatModeSelectNodeEditor;

export { HeatModeSelectNodeType };
