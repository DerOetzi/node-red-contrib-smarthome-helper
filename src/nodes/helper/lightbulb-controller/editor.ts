import { EditorNodeDef } from "node-red";
import BaseNodeEditor from "../../flowctrl/base/editor";
import {
  getMatchers,
  initializeMatcherRows,
} from "../../flowctrl/match-join/editor";
import {
  defaultLightbulbControllerNodeConfig,
  LightbulbControllerNodeEditorProperties,
  LightbulbControllerNodeType,
} from "./types";

const LightbulbControllerNodeEditor: EditorNodeDef<LightbulbControllerNodeEditorProperties> =
  {
    ...BaseNodeEditor,
    category: LightbulbControllerNodeType.categoryLabel,
    color: LightbulbControllerNodeType.color,
    defaults: {
      ...BaseNodeEditor.defaults,
      matchers: {
        value: defaultLightbulbControllerNodeConfig.matchers!,
        required: true,
      },
      join: {
        value: defaultLightbulbControllerNodeConfig.join!,
        required: true,
      },
      discardNotMatched: {
        value: defaultLightbulbControllerNodeConfig.discardNotMatched!,
        required: true,
      },
      minMsgCount: {
        value: defaultLightbulbControllerNodeConfig.minMsgCount!,
        required: true,
      },
      identifier: {
        value: defaultLightbulbControllerNodeConfig.identifier!,
        required: true,
      },
      identifierType: {
        value: defaultLightbulbControllerNodeConfig.identifierType!,
        required: true,
      },
      lightbulbType: {
        value: defaultLightbulbControllerNodeConfig.lightbulbType!,
        required: true,
      },
      homeAssistantOutput: {
        value: defaultLightbulbControllerNodeConfig.homeAssistantOutput!,
        required: false,
      },
      onBrightness: {
        value: defaultLightbulbControllerNodeConfig.onBrightness!,
        required: true,
      },
      transitionTime: {
        value: defaultLightbulbControllerNodeConfig.transitionTime!,
        required: true,
      },
      colorTemperature: {
        value: defaultLightbulbControllerNodeConfig.colorTemperature!,
        required: true,
      },
      nightmodeBrightness: {
        value: defaultLightbulbControllerNodeConfig.nightmodeBrightness!,
        required: true,
      },
      onCommand: {
        value: defaultLightbulbControllerNodeConfig.onCommand!,
        required: true,
      },
      offCommand: {
        value: defaultLightbulbControllerNodeConfig.offCommand!,
        required: true,
      },
      nightmodeCommand: {
        value: defaultLightbulbControllerNodeConfig.nightmodeCommand!,
        required: true,
      },
      colorCycle: {
        value: defaultLightbulbControllerNodeConfig.colorCycle!,
        required: false,
      },
      fixColorHue: {
        value: defaultLightbulbControllerNodeConfig.fixColorHue!,
        required: true,
      },
      fixColorSaturation: {
        value: defaultLightbulbControllerNodeConfig.fixColorSaturation!,
        required: true,
      },
    },
    icon: "lightbulb.svg",
    label: function () {
      const label = this.lightbulbType;
      return this.name ? `${this.name} (${label})` : label;
    },
    oneditprepare: function () {
      BaseNodeEditor.oneditprepare!.call(this);

      initializeMatcherRows("#matcher-rows", false, this.matchers, true);

      $("#node-input-identifier").typedInput({
        types: ["msg", "str"],
        typeField: "#node-input-identifierType",
      });

      let brightnessRow = $("#node-input-onBrightness")
        .parent()
        .toggle(this.lightbulbType !== "switch");

      let transitionTimeRow = $("#node-input-transitionTime")
        .parent()
        .toggle(this.lightbulbType !== "switch");

      let colortemperatureMatcherRow = $("#matcher-rows [data-row='1']")
        .parent()
        .toggle(this.lightbulbType === "colortemperature");

      let colortemperatureRow = $("#node-input-colorTemperature")
        .parent()
        .toggle(this.lightbulbType === "colortemperature");

      let nightmodeBrightnessRow = $("#node-input-nightmodeBrightness")
        .parent()
        .toggle(this.lightbulbType !== "switch");

      let nightmodeCommandRow = $("#node-input-nightmodeCommand")
        .parent()
        .toggle(this.lightbulbType !== "switch");

      let colorCycleRow = $("#node-input-colorCycle")
        .parent()
        .toggle(this.lightbulbType === "rgb");

      let fixColorRow = $("#node-input-fixColorHue")
        .parent()
        .toggle(this.lightbulbType === "rgb" && !this.colorCycle);

      let matcherHueRow = $("#matcher-rows [data-row='2']")
        .parent()
        .toggle(this.lightbulbType === "rgb" && !this.colorCycle);

      let matcherSaturationRow = $("#matcher-rows [data-row='3']")
        .parent()
        .toggle(this.lightbulbType === "rgb" && !this.colorCycle);

      $("#node-input-lightbulbType").on("change", function () {
        let lightbulbType = $(this).val() as string;
        let isSwitch = lightbulbType === "switch";

        brightnessRow.toggle(!isSwitch);
        transitionTimeRow.toggle(!isSwitch);
        nightmodeBrightnessRow.toggle(!isSwitch);
        nightmodeCommandRow.toggle(!isSwitch);

        colortemperatureMatcherRow.toggle(lightbulbType === "colortemperature");
        colortemperatureRow.toggle(lightbulbType === "colortemperature");

        colorCycleRow.toggle(lightbulbType === "rgb");
        fixColorRow.toggle(
          lightbulbType === "rgb" && !$("#node-input-colorCycle").is(":checked")
        );
        matcherHueRow.toggle(
          lightbulbType === "rgb" && !$("#node-input-colorCycle").is(":checked")
        );
        matcherSaturationRow.toggle(
          lightbulbType === "rgb" && !$("#node-input-colorCycle").is(":checked")
        );
      });

      $("#node-input-colorCycle").on("change", function () {
        fixColorRow.toggle(!$(this).is(":checked"));
        matcherHueRow.toggle(!$(this).is(":checked"));
        matcherSaturationRow.toggle(!$(this).is(":checked"));
      });
    },
    oneditsave: function () {
      this.matchers = getMatchers("#matcher-rows");
    },
  };

export default LightbulbControllerNodeEditor;

export { LightbulbControllerNodeType };
