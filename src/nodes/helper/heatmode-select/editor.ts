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
      checkAutomationInProgress: {
        value: defaultHeatModeSelectNodeConfig.checkAutomationInProgress!,
        required: false,
      },
      automationProgressId: {
        value: defaultHeatModeSelectNodeConfig.automationProgressId!,
        required: true,
      },
      pauseTime: {
        value: defaultHeatModeSelectNodeConfig.pauseTime!,
        required: true,
      },
      pauseTimeUnit: {
        value: defaultHeatModeSelectNodeConfig.pauseTimeUnit!,
        required: true,
      },
      outputs: {
        value: defaultHeatModeSelectNodeConfig.outputs!,
        required: true,
      },
    },
    outputLabels: ["selection", "gate control"],
    icon: "switch.svg",
    label: function () {
      return this.name || HeatModeSelectNodeType.name;
    },
    oneditprepare: function () {
      if (BaseNodeEditor.oneditprepare) {
        BaseNodeEditor.oneditprepare.call(this);
      }

      initializeMatcherRows("#matcher-rows", false, this.matchers, true, "", {
        heatmode: "heatmode",
        comfortTemp: "comfort temperature",
        ecoTempOffset: "eco temperature offset",
      });

      const automationProgressIdRow = $("#node-input-automationProgressId")
        .parent()
        .toggle(this.checkAutomationInProgress);

      const pauseTimeRow = $("#node-input-pauseTime")
        .parent()
        .toggle(this.checkAutomationInProgress);

      $("#node-input-checkAutomationInProgress").on("change", function () {
        automationProgressIdRow.toggle($(this).is(":checked"));
        pauseTimeRow.toggle($(this).is(":checked"));
      });
    },
    oneditsave: function () {
      this.matchers = getMatchers("#matcher-rows");
    },
  };

export default HeatModeSelectNodeEditor;

export { HeatModeSelectNodeType };
