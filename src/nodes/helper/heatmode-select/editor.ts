import { EditorNodeDef } from "node-red";
import BaseNodeEditor from "../../flowctrl/base/editor";
import {
  getMatchers,
  initializeMatcherRows,
} from "../../flowctrl/match-join/editor";
import {
  defaultHeatModeSelectNodeConfig,
  HeatModeSelectNodeEditorProperties,
  HeatModeSelectNodeType,
} from "./types";

const HeatModeSelectNodeEditor: EditorNodeDef<HeatModeSelectNodeEditorProperties> =
  {
    ...BaseNodeEditor,
    category: HeatModeSelectNodeType.categoryLabel,
    color: HeatModeSelectNodeType.color,
    defaults: {
      ...BaseNodeEditor.defaults,
      matchers: {
        value: defaultHeatModeSelectNodeConfig.matchers!,
        required: true,
      },
      join: { value: defaultHeatModeSelectNodeConfig.join!, required: false },
      discardNotMatched: {
        value: defaultHeatModeSelectNodeConfig.discardNotMatched!,
        required: false,
      },
      minMsgCount: {
        value: defaultHeatModeSelectNodeConfig.minMsgCount!,
        required: true,
      },
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
    },
    outputs: 1,
    outputLabels: ["selection"],
    icon: "switch.svg",
    label: function () {
      return this.name || HeatModeSelectNodeType.name;
    },
    oneditprepare: function () {
      if (BaseNodeEditor.oneditprepare) {
        BaseNodeEditor.oneditprepare.call(this);
      }

      initializeMatcherRows("#matcher-rows", false, this.matchers);
    },
    oneditsave: function () {
      this.matchers = getMatchers("#matcher-rows");
    },
  };

export default HeatModeSelectNodeEditor;

export { HeatModeSelectNodeType };
