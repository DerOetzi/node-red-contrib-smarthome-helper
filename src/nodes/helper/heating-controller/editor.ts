import { EditorNodeDef } from "node-red";
import BaseNodeEditor from "../../flowctrl/base/editor";
import {
  getMatchers,
  initializeMatcherRows,
} from "../../flowctrl/match-join/editor";
import {
  defaultHeatingControllerNodeConfig,
  HeatingControllerNodeEditorProperties,
  HeatingControllerNodeType,
} from "./types";

const HeatingControllerNodeEditor: EditorNodeDef<HeatingControllerNodeEditorProperties> =
  {
    ...BaseNodeEditor,
    category: HeatingControllerNodeType.categoryLabel,
    color: HeatingControllerNodeType.color,
    defaults: {
      ...BaseNodeEditor.defaults,
      matchers: {
        value: defaultHeatingControllerNodeConfig.matchers!,
        required: true,
      },
      join: {
        value: defaultHeatingControllerNodeConfig.join!,
        required: true,
      },
      discardNotMatched: {
        value: defaultHeatingControllerNodeConfig.discardNotMatched!,
        required: true,
      },
      minMsgCount: {
        value: defaultHeatingControllerNodeConfig.minMsgCount!,
        required: true,
      },
      pause: {
        value: defaultHeatingControllerNodeConfig.pause!,
        required: true,
      },
      pauseUnit: {
        value: defaultHeatingControllerNodeConfig.pauseUnit!,
        required: true,
      },
      boostTemperatureOffset: {
        value: defaultHeatingControllerNodeConfig.boostTemperatureOffset!,
        required: true,
      },
      frostProtectionTemperature: {
        value: defaultHeatingControllerNodeConfig.frostProtectionTemperature!,
        required: true,
      },
      comfortCommand: {
        value: defaultHeatingControllerNodeConfig.comfortCommand!,
        required: true,
      },
      ecoCommand: {
        value: defaultHeatingControllerNodeConfig.ecoCommand!,
        required: true,
      },
      frostProtectionCommand: {
        value: defaultHeatingControllerNodeConfig.frostProtectionCommand!,
        required: true,
      },
      boostCommand: {
        value: defaultHeatingControllerNodeConfig.boostCommand!,
        required: true,
      },
      statusDelay: {
        value: defaultHeatingControllerNodeConfig.statusDelay!,
        required: true,
      },
      outputs: {
        value: defaultHeatingControllerNodeConfig.outputs!,
        required: true,
      },
    },
    icon: "heating.svg",
    label: function () {
      return this.name || HeatingControllerNodeType.name;
    },
    outputLabels: ["heatmode", "temperature", "window", "status"],
    oneditprepare: function () {
      BaseNodeEditor.oneditprepare!.call(this);

      initializeMatcherRows(this.matchers, {
        targets: [
          "activeCondition",
          "comfortTemperature",
          "ecoTemperatureOffset",
          "windowOpen",
          "manual_control",
          "command",
        ],
        translatePrefix: "helper.heating-controller.target",
        t: this._,
      });
    },
    oneditsave: function () {
      this.matchers = getMatchers();
    },
  };

export default HeatingControllerNodeEditor;
