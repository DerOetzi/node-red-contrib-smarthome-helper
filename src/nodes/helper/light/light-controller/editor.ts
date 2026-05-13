import {
  i18nFieldDefault,
  NodeEditorDefinition,
  NodeEditorFormBuilder,
  NodeEditorFormEditableList,
} from "../../../flowctrl/base/editor";
import { MatchJoinEditableList } from "../../../flowctrl/match-join/editor";
import LightControllerNode from "./";
import {
  LightControllerEditorNodeProperties,
  LightControllerNodeOptions,
  LightControllerNodeOptionsDefaults,
  LightControllerTarget,
  LightIdentifierRow,
  LightType,
} from "./types";

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

const inputMatcherList = new MatchJoinEditableList({
  targets: Object.values(LightControllerTarget),
  translatePrefix: "helper.light-controller",
});

const identifierList = new LightbulbIdentifiersEditableList();

function buildLightControllerFormContent(
  node: LightControllerEditorNodeProperties,
): void {
  const builder = new NodeEditorFormBuilder($("#light-controller-options"), {
    translatePrefix: "helper.light-controller",
  });

  const lightbulbTypeSelect = builder.createSelectInput({
    id: "node-input-lightbulbType",
    label: "lightbulbType",
    value: node.lightbulbType,
    options: Object.keys(LightType),
    icon: "lightbulb-o",
  });

  const isColorTemperature = node.lightbulbType === LightType.colortemperature;
  const isSwitch = node.lightbulbType === LightType.switch;
  const isRGB = node.lightbulbType === LightType.rgb;

  builder.createCheckboxInput({
    id: "node-input-homeAssistantOutput",
    label: "homeAssistantOutput",
    value: node.homeAssistantOutput,
    icon: "home",
  });

  builder.line();

  const brightnessRow = builder
    .createNumberInput({
      id: "node-input-onBrightness",
      label: "onBrightness",
      value: node.onBrightness,
      icon: "sun",
      min: 10,
      max: 100,
      step: 5,
    })
    .parent()
    .toggle(!isSwitch);

  const transitionTimeRow = builder
    .createNumberInput({
      id: "node-input-transitionTime",
      label: "transitionTime",
      value: node.transitionTime,
      icon: "clock-o",
      min: 0,
      max: 10,
      step: 0.1,
    })
    .parent()
    .toggle(!isSwitch);

  const colorTemperatureRow = builder
    .createNumberInput({
      id: "node-input-colorTemperature",
      label: "colorTemperature",
      value: node.colorTemperature,
      icon: "lightbulb-o",
      min: 2000,
      max: 6500,
      step: 50,
    })
    .parent()
    .toggle(isColorTemperature);

  inputMatcherList.showHideTarget(
    isColorTemperature,
    LightControllerTarget.colorTemperature,
  );

  const nightmodeBrightnessRow = builder
    .createNumberInput({
      id: "node-input-nightmodeBrightness",
      label: "nightmodeBrightness",
      value: node.nightmodeBrightness,
      icon: "moon-o",
      min: 5,
      max: 40,
      step: 5,
    })
    .parent()
    .toggle(!isSwitch);

  const colorCycleInput = builder.createCheckboxInput({
    id: "node-input-colorCycle",
    label: "colorCycle",
    value: node.colorCycle,
    icon: "refresh",
  });

  const colorCycleRow = colorCycleInput.parent().toggle(isRGB);

  const showColor = isRGB && !node.colorCycle;

  const fixColorHueRow = builder
    .createNumberInput({
      id: "node-input-fixColorHue",
      label: "fixColorHue",
      value: node.fixColorHue,
      icon: "paint-brush",
      min: 0,
      max: 360,
    })
    .parent()
    .toggle(showColor);

  const fixColorSaturationRow = builder
    .createNumberInput({
      id: "node-input-fixColorSaturation",
      label: "fixColorSaturation",
      value: node.fixColorSaturation,
      icon: "adjust",
      min: 0,
      max: 100,
    })
    .parent()
    .toggle(showColor);

  inputMatcherList.showHideTarget(showColor, LightControllerTarget.hue);
  inputMatcherList.showHideTarget(showColor, LightControllerTarget.saturation);

  builder.line();

  builder.createTextInput({
    id: "node-input-onCommand",
    label: "onCommand",
    value: node.onCommand,
    icon: "play",
  });

  builder.createTextInput({
    id: "node-input-offCommand",
    label: "offCommand",
    value: node.offCommand,
    icon: "stop",
  });

  const nightmodeCommandRow = builder
    .createTextInput({
      id: "node-input-nightmodeCommand",
      label: "nightmodeCommand",
      value: node.nightmodeCommand,
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
      LightControllerTarget.colorTemperature,
    );

    nightmodeBrightnessRow.toggle(!isSwitch);

    colorCycleRow.toggle(isRGB);

    fixColorHueRow.toggle(showColor);
    fixColorSaturationRow.toggle(showColor);
    inputMatcherList.removeTarget(showColor, LightControllerTarget.hue);
    inputMatcherList.removeTarget(showColor, LightControllerTarget.saturation);

    nightmodeCommandRow.toggle(!isSwitch);
  });

  colorCycleInput.on("change", function () {
    const isRGB = (lightbulbTypeSelect.val() as LightType) === LightType.rgb;
    const showColor = isRGB && !$(this).is(":checked");

    fixColorHueRow.toggle(showColor);
    fixColorSaturationRow.toggle(showColor);
    inputMatcherList.removeTarget(showColor, LightControllerTarget.hue);
    inputMatcherList.removeTarget(showColor, LightControllerTarget.saturation);
  });
}

export const LightControllerEditorDef: NodeEditorDefinition<
  LightControllerNodeOptions,
  LightControllerEditorNodeProperties
> = {
  localePrefix: "helper.light-controller",
  nodeClass: LightControllerNode,
  defaults: LightControllerNodeOptionsDefaults,
  icon: "font-awesome/fa-lightbulb-o",
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
  labelSuffix: "lightbulbType",
  baseTemplate: "input-only",
  lists: [
    {
      id: "matcher-rows",
      create: () => inputMatcherList,
      dataKey: "matchers",
      rowTranslatePrefix: "flowctrl.match-join",
    },
    {
      id: "identifier-rows",
      create: () => identifierList,
      dataKey: "identifiers",
      rowTranslatePrefix: "helper.light-controller",
    },
  ],
  form: {
    id: "light-controller-options",
    build: buildLightControllerFormContent,
  },
  hooks: {
    onadd: (node) => {
      node.onCommand = i18nFieldDefault("helper.light-controller", "onCommand");
      node.offCommand = i18nFieldDefault(
        "helper.light-controller",
        "offCommand",
      );
      node.nightmodeCommand = i18nFieldDefault(
        "helper.light-controller",
        "nightmodeCommand",
      );
    },
  },
};

