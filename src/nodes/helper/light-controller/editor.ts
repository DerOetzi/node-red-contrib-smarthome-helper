import { EditorNodeDef } from "node-red";
import BaseNodeEditor, {
  i18n,
  NodeEditorFormBuilder,
  NodeEditorFormEditableList,
} from "../../flowctrl/base/editor";
import { MatchJoinEditableList } from "../../flowctrl/match-join/editor";
import LightControllerNode from "./";
import { lightControllerMigration } from "./migration";
import {
  LightControllerEditorNodeProperties,
  LightControllerEditorNodePropertiesDefaults,
  LightControllerNodeOptionsDefaults,
  LightControllerTarget,
  LightIdentifierRow,
  LightType,
} from "./types";
const inputMatcherList = new MatchJoinEditableList({
  targets: Object.values(LightControllerTarget),
  translatePrefix: "helper.light-controller",
});

class LightbulbIdentifiersEditableList extends NodeEditorFormEditableList<LightIdentifierRow> {
  protected addItem(data: LightIdentifierRow) {
    this.rowBuilder!.createTypedInput({
      id: "identifier",
      idType: "identifierType",
      label: "identifier",
      value: data.identifier ?? "",
      valueType: data.identifierType ?? "str",
      icon: "tag",
      types: ["str", "msg"],
    });
  }
}

const identifierList = new LightbulbIdentifiersEditableList();

const LightControllerEditorNode: EditorNodeDef<LightControllerEditorNodeProperties> =
  {
    category: LightControllerNode.NodeCategory.label,
    color: LightControllerNode.NodeColor,
    icon: "font-awesome/fa-lightbulb-o",
    defaults: LightControllerEditorNodePropertiesDefaults,
    label: function () {
      const label = i18n(
        "helper.light-controller.select.lightbulbType." + this.lightbulbType
      );
      return this.name ? `${this.name} (${label})` : label;
    },
    inputs: LightControllerNodeOptionsDefaults.inputs,
    outputs: LightControllerNodeOptionsDefaults.outputs,
    outputLabels: function (_: number) {
      return i18n("helper.light-controller.output.command");
    },
    onadd: function () {
      this.onCommand = i18n("helper.light-controller.default.onCommand");
      this.offCommand = i18n("helper.light-controller.default.offCommand");
      this.nightmodeCommand = i18n(
        "helper.light-controller.default.nightmodeCommand"
      );
    },
    oneditprepare: function () {
      lightControllerMigration.checkAndMigrate(this);

      BaseNodeEditor.oneditprepare!.call(this);

      inputMatcherList.initialize("matcher-rows", this.matchers, {
        translatePrefix: "flowctrl.match-join",
      });

      identifierList.initialize("identifier-rows", this.identifiers, {
        translatePrefix: "helper.light-controller",
      });

      const lightControllerOptionsBuilder = new NodeEditorFormBuilder(
        $("#light-controller-options"),
        { translatePrefix: "helper.light-controller" }
      );

      const lightbulbTypeSelect =
        lightControllerOptionsBuilder.createSelectInput({
          id: "node-input-lightbulbType",
          label: "lightbulbType",
          value: this.lightbulbType,
          options: Object.keys(LightType),
          icon: "lightbulb-o",
        });

      const isColorTemperature =
        this.lightbulbType === LightType.colortemperature;
      const isSwitch = this.lightbulbType === LightType.switch;
      const isRGB = this.lightbulbType === LightType.rgb;

      lightControllerOptionsBuilder.createCheckboxInput({
        id: "node-input-homeAssistantOutput",
        label: "homeAssistantOutput",
        value: this.homeAssistantOutput,
        icon: "home",
      });

      lightControllerOptionsBuilder.line();

      const brightnessRow = lightControllerOptionsBuilder
        .createNumberInput({
          id: "node-input-onBrightness",
          label: "onBrightness",
          value: this.onBrightness,
          icon: "sun",
          min: 10,
          max: 100,
          step: 5,
        })
        .parent()
        .toggle(!isSwitch);

      const transitionTimeRow = lightControllerOptionsBuilder
        .createNumberInput({
          id: "node-input-transitionTime",
          label: "transitionTime",
          value: this.transitionTime,
          icon: "clock-o",
          min: 0,
          max: 10,
          step: 0.1,
        })
        .parent()
        .toggle(!isSwitch);

      const colorTemperatureRow = lightControllerOptionsBuilder
        .createNumberInput({
          id: "node-input-colorTemperature",
          label: "colorTemperature",
          value: this.colorTemperature,
          icon: "lightbulb-o",
          min: 153,
          max: 500,
          step: 1,
        })
        .parent()
        .toggle(isColorTemperature);

      inputMatcherList.showHideTarget(
        isColorTemperature,
        LightControllerTarget.colorTemperature
      );

      const nightmodeBrightnessRow = lightControllerOptionsBuilder
        .createNumberInput({
          id: "node-input-nightmodeBrightness",
          label: "nightmodeBrightness",
          value: this.nightmodeBrightness,
          icon: "moon-o",
          min: 5,
          max: 40,
          step: 5,
        })
        .parent()
        .toggle(!isSwitch);

      const colorCycleInput = lightControllerOptionsBuilder.createCheckboxInput(
        {
          id: "node-input-colorCycle",
          label: "colorCycle",
          value: this.colorCycle,
          icon: "refresh",
        }
      );

      const colorCycleRow = colorCycleInput.parent().toggle(isRGB);

      const showColor = isRGB && !this.colorCycle;

      const fixColorHueRow = lightControllerOptionsBuilder
        .createNumberInput({
          id: "node-input-fixColorHue",
          label: "fixColorHue",
          value: this.fixColorHue,
          icon: "paint-brush",
          min: 0,
          max: 360,
        })
        .parent()
        .toggle(showColor);

      const fixColorSaturationRow = lightControllerOptionsBuilder
        .createNumberInput({
          id: "node-input-fixColorSaturation",
          label: "fixColorSaturation",
          value: this.fixColorSaturation,
          icon: "adjust",
          min: 0,
          max: 100,
        })
        .parent()
        .toggle(showColor);

      inputMatcherList.showHideTarget(showColor, LightControllerTarget.hue);
      inputMatcherList.showHideTarget(
        showColor,
        LightControllerTarget.saturation
      );

      lightControllerOptionsBuilder.line();

      lightControllerOptionsBuilder.createTextInput({
        id: "node-input-onCommand",
        label: "onCommand",
        value: this.onCommand,
        icon: "play",
      });

      lightControllerOptionsBuilder.createTextInput({
        id: "node-input-offCommand",
        label: "offCommand",
        value: this.offCommand,
        icon: "stop",
      });

      const nightmodeCommandRow = lightControllerOptionsBuilder
        .createTextInput({
          id: "node-input-nightmodeCommand",
          label: "nightmodeCommand",
          value: this.nightmodeCommand,
          icon: "moon-o",
        })
        .parent()
        .toggle(!isSwitch);

      lightbulbTypeSelect.on("change", function () {
        const lightbulbType = $(this).val() as LightType;
        const isColorTemperature = lightbulbType === LightType.colortemperature;
        const isSwitch = lightbulbType === LightType.switch;
        const isRGB = lightbulbType === LightType.rgb;
        const showColor = isRGB && !colorCycleInput.is(":checked");

        brightnessRow.toggle(!isSwitch);
        transitionTimeRow.toggle(!isSwitch);

        colorTemperatureRow.toggle(isColorTemperature);
        inputMatcherList.removeTarget(
          isColorTemperature,
          LightControllerTarget.colorTemperature
        );

        nightmodeBrightnessRow.toggle(!isSwitch);

        colorCycleRow.toggle(isRGB);

        fixColorHueRow.toggle(showColor);
        fixColorSaturationRow.toggle(showColor);
        inputMatcherList.removeTarget(showColor, LightControllerTarget.hue);
        inputMatcherList.removeTarget(
          showColor,
          LightControllerTarget.saturation
        );

        nightmodeCommandRow.toggle(!isSwitch);
      });

      colorCycleInput.on("change", function () {
        const isRGB =
          (lightbulbTypeSelect.val() as LightType) === LightType.rgb;
        const showColor = isRGB && !$(this).is(":checked");

        fixColorHueRow.toggle(showColor);
        fixColorSaturationRow.toggle(showColor);
        inputMatcherList.removeTarget(showColor, LightControllerTarget.hue);
        inputMatcherList.removeTarget(
          showColor,
          LightControllerTarget.saturation
        );
      });
    },
    oneditsave: function () {
      this.matchers = inputMatcherList.values();
      this.identifiers = identifierList.values();
    },
  };

export default LightControllerEditorNode;
