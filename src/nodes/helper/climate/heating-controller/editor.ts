import { ActiveControllerTarget } from "../../../flowctrl/active-controller/types";
import {
  i18nFieldDefault,
  NodeEditorDefinition,
  NodeEditorFormBuilder,
} from "../../../flowctrl/base/editor";
import { MatchJoinEditableList } from "../../../flowctrl/match-join/editor";
import HeatingControllerNode from "./";
import {
  HeatingControllerEditorNodeProperties,
  HeatingControllerNodeOptions,
  HeatingControllerNodeOptionsDefaults,
  HeatingControllerTarget,
} from "./types";

const controlMatcherList = new MatchJoinEditableList({
  targets: [
    ActiveControllerTarget.activeCondition,
    HeatingControllerTarget.comfortCondition,
    ActiveControllerTarget.manualControl,
    ActiveControllerTarget.command,
    HeatingControllerTarget.windowOpen,
  ],
  translatePrefix: "helper.heating-controller",
  headerPrefix: "helper.heating-controller",
});

const temperatureMatcherList = new MatchJoinEditableList({
  targets: [
    HeatingControllerTarget.comfortTemperature,
    HeatingControllerTarget.ecoTemperatureOffset,
  ],
  translatePrefix: "helper.heating-controller",
  headerPrefix: "helper.heating-controller",
});

const boostMatcherList = new MatchJoinEditableList({
  targets: [HeatingControllerTarget.pvBoost],
  translatePrefix: "helper.heating-controller",
  headerPrefix: "helper.heating-controller",
});

function buildHeatingControllerFormContent(
  node: HeatingControllerEditorNodeProperties,
): void {
  const builder = new NodeEditorFormBuilder($("#heating-controller-options"), {
    translatePrefix: "helper.heating-controller",
  });

  builder.createCheckboxInput({
    id: "node-input-defaultActive",
    label: "defaultActive",
    value: node.defaultActive,
    icon: "toggle-on",
  });

  const reactivateEnabled = builder.createCheckboxInput({
    id: "node-input-reactivateEnabled",
    label: "reactivateEnabled",
    value: node.reactivateEnabled,
    icon: "toggle-on",
  });

  const pauseInputRow = builder
    .createTimeInput({
      id: "node-input-pause",
      idType: "node-input-pauseUnit",
      label: "pause",
      value: node.pause,
      valueType: node.pauseUnit,
      icon: "clock-o",
    })
    .parent()
    .toggle(node.reactivateEnabled);

  reactivateEnabled.on("change", function () {
    pauseInputRow.toggle($(this).is(":checked"));
  });

  builder.createCheckboxInput({
    id: "node-input-defaultComfort",
    label: "defaultComfort",
    value: node.defaultComfort,
    icon: "toggle-on",
  });

  const boostEnabledCheckbox = builder.createCheckboxInput({
    id: "node-input-boostEnabled",
    label: "boostEnabled",
    value: node.boostEnabled,
    icon: "fire",
  });

  const boostTemperatureOffsetRow = builder
    .createNumberInput({
      id: "node-input-boostTemperatureOffset",
      label: "boostTemperatureOffset",
      value: node.boostTemperatureOffset,
      icon: "fire",
      min: 5,
      max: 10,
    })
    .parent()
    .toggle(node.boostEnabled);

  const pvBoostEnabledCheckbox = builder.createCheckboxInput({
    id: "node-input-pvBoostEnabled",
    label: "pvBoostEnabled",
    value: node.pvBoostEnabled,
    icon: "sun-o",
  });

  boostMatcherList.showHideTarget(
    node.pvBoostEnabled,
    HeatingControllerTarget.pvBoost,
  );

  const pvBoostTemperatureOffsetRow = builder
    .createNumberInput({
      id: "node-input-pvBoostTemperatureOffset",
      label: "pvBoostTemperatureOffset",
      value: node.pvBoostTemperatureOffset,
      icon: "sun-o",
      min: 0,
      max: 3,
      step: 1,
    })
    .parent()
    .toggle(node.pvBoostEnabled);

  pvBoostEnabledCheckbox.on("change", function () {
    const isChecked = $(this).is(":checked");
    pvBoostTemperatureOffsetRow.toggle(isChecked);
    boostMatcherList.removeTarget(isChecked, HeatingControllerTarget.pvBoost);
  });

  builder.createNumberInput({
    id: "frostProtectionTemperature",
    label: "frostProtectionTemperature",
    value: node.frostProtectionTemperature,
    icon: "snowflake-o",
    min: 5,
    max: 9,
  });

  builder.line();

  builder.createTextInput({
    id: "node-input-comfortCommand",
    label: "comfortCommand",
    value: node.comfortCommand,
    icon: "home",
  });

  builder.createTextInput({
    id: "node-input-ecoCommand",
    label: "ecoCommand",
    value: node.ecoCommand,
    icon: "leaf",
  });

  const boostCommandRow = builder
    .createTextInput({
      id: "node-input-boostCommand",
      label: "boostCommand",
      value: node.boostCommand,
      icon: "fire",
    })
    .parent()
    .toggle(node.boostEnabled);

  boostEnabledCheckbox.on("change", function () {
    const isChecked = $(this).is(":checked");
    boostTemperatureOffsetRow.toggle(isChecked);
    boostCommandRow.toggle(isChecked);
  });

  builder.createTextInput({
    id: "node-input-frostProtectionCommand",
    label: "frostProtectionCommand",
    value: node.frostProtectionCommand,
    icon: "snowflake-o",
  });
}

export const HeatingControllerEditorDef: NodeEditorDefinition<
  HeatingControllerNodeOptions,
  HeatingControllerEditorNodeProperties
> = {
  localePrefix: "helper.heating-controller",
  nodeClass: HeatingControllerNode,
  defaults: HeatingControllerNodeOptionsDefaults,
  icon: "font-awesome/fa-thermometer-half",
  inputMode: "matcher-topic",
  fieldKeys: [
    "target",
    "defaultActive",
    "reactivateEnabled",
    "pause",
    "defaultComfort",
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
  outputKeys: ["heatmode", "temperature", "window"],
  baseTemplate: "input-only",
  lists: [
    {
      id: "matcher-rows-control",
      create: () => controlMatcherList,
      dataKey: "matchers",
      rowTranslatePrefix: "flowctrl.match-join",
    },
    {
      id: "matcher-rows-temperature",
      create: () => temperatureMatcherList,
      dataKey: "matchers",
      rowTranslatePrefix: "flowctrl.match-join",
    },
    {
      id: "matcher-rows-boost",
      create: () => boostMatcherList,
      dataKey: "matchers",
      rowTranslatePrefix: "flowctrl.match-join",
    },
  ],
  form: {
    id: "heating-controller-options",
    build: buildHeatingControllerFormContent,
  },
  hooks: {
    onadd: (node) => {
      node.comfortCommand = i18nFieldDefault(
        "helper.heating-controller",
        "comfortCommand",
      );
      node.ecoCommand = i18nFieldDefault(
        "helper.heating-controller",
        "ecoCommand",
      );
      node.boostCommand = i18nFieldDefault(
        "helper.heating-controller",
        "boostCommand",
      );
      node.frostProtectionCommand = i18nFieldDefault(
        "helper.heating-controller",
        "frostProtectionCommand",
      );
    },
  },
};
