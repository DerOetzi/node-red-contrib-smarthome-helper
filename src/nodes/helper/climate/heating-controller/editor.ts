import { EditorNodeDef } from "node-red";
import { ActiveControllerTarget } from "../../../flowctrl/active-controller/types";
import BaseEditorNode, {
  createEditorDefaults,
  i18n,
  i18nFieldDefault,
  i18nOutputLabel,
  NodeEditorFormBuilder,
} from "../../../flowctrl/base/editor";
import {
  InputEditorTemplate,
  MatchJoinEditableList,
} from "../../../flowctrl/match-join/editor";
import {
  EditorMetadata,
  EditorTemplateDiv,
  EditorTemplateOl,
  EditorTemplateLine,
} from "../../../types";
import HeatingControllerNode from "./";
import {
  HeatingControllerEditorNodeProperties,
  HeatingControllerNodeOptions,
  HeatingControllerNodeOptionsDefaults,
  HeatingControllerTarget,
} from "./types";

export const HeatingControllerEditorTemplate = [
  new EditorTemplateOl("matcher-rows-control"),
  EditorTemplateLine,
  new EditorTemplateOl("matcher-rows-temperature"),
  EditorTemplateLine,
  new EditorTemplateOl("matcher-rows-boost"),
  EditorTemplateLine,
  new EditorTemplateDiv("heating-controller-options"),
  ...InputEditorTemplate,
];

export const HeatingControllerEditorMetadata: EditorMetadata = {
  localePrefix: "helper.heating-controller",
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
  outputKeys: ["heatmode", "temperature", "window", "status"],
  template: HeatingControllerEditorTemplate,
};

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

const HeatingControllerEditorNode: EditorNodeDef<HeatingControllerEditorNodeProperties> =
  {
    category: HeatingControllerNode.NodeCategoryLabel,
    color: HeatingControllerNode.NodeColor,
    icon: "font-awesome/fa-thermometer-half",
    defaults: createEditorDefaults<
      HeatingControllerNodeOptions,
      HeatingControllerEditorNodeProperties
    >(HeatingControllerNodeOptionsDefaults),
    label: function () {
      return this.name?.trim()
        ? this.name.trim()
        : i18n("helper.heating-controller.name");
    },
    inputs: HeatingControllerNodeOptionsDefaults.inputs,
    outputs: HeatingControllerNodeOptionsDefaults.outputs,
    outputLabels: function (index: number) {
      const outputs = ["heatmode", "temperature", "window"];

      return i18nOutputLabel("helper.heating-controller", outputs[index]);
    },
    onadd: function () {
      this.comfortCommand = i18nFieldDefault(
        "helper.heating-controller",
        "comfortCommand",
      );
      this.ecoCommand = i18nFieldDefault(
        "helper.heating-controller",
        "ecoCommand",
      );
      this.boostCommand = i18nFieldDefault(
        "helper.heating-controller",
        "boostCommand",
      );
      this.frostProtectionCommand = i18nFieldDefault(
        "helper.heating-controller",
        "frostProtectionCommand",
      );
    },
    oneditprepare: function () {
      BaseEditorNode.oneditprepare!.call(this);

      controlMatcherList.initialize("matcher-rows-control", this.matchers, {
        translatePrefix: "flowctrl.match-join",
      });

      temperatureMatcherList.initialize(
        "matcher-rows-temperature",
        this.matchers,
        { translatePrefix: "flowctrl.match-join" },
      );

      boostMatcherList.initialize("matcher-rows-boost", this.matchers, {
        translatePrefix: "flowctrl.match-join",
      });

      const heatingControllerOptionsBuilder = new NodeEditorFormBuilder(
        $("#heating-controller-options"),
        {
          translatePrefix: "helper.heating-controller",
        },
      );

      heatingControllerOptionsBuilder.createCheckboxInput({
        id: "node-input-defaultActive",
        label: "defaultActive",
        value: this.defaultActive,
        icon: "toggle-on",
      });

      const reactivateEnabled =
        heatingControllerOptionsBuilder.createCheckboxInput({
          id: "node-input-reactivateEnabled",
          label: "reactivateEnabled",
          value: this.reactivateEnabled,
          icon: "toggle-on",
        });

      const pauseInputRow = heatingControllerOptionsBuilder
        .createTimeInput({
          id: "node-input-pause",
          idType: "node-input-pauseUnit",
          label: "pause",
          value: this.pause,
          valueType: this.pauseUnit,
          icon: "clock-o",
        })
        .parent()
        .toggle(this.reactivateEnabled);

      reactivateEnabled.on("change", function () {
        pauseInputRow.toggle($(this).is(":checked"));
      });

      heatingControllerOptionsBuilder.createCheckboxInput({
        id: "node-input-defaultComfort",
        label: "defaultComfort",
        value: this.defaultComfort,
        icon: "toggle-on",
      });

      const boostEnabledCheckbox =
        heatingControllerOptionsBuilder.createCheckboxInput({
          id: "node-input-boostEnabled",
          label: "boostEnabled",
          value: this.boostEnabled,
          icon: "fire",
        });

      const boostTemperatureOffsetRow = heatingControllerOptionsBuilder
        .createNumberInput({
          id: "node-input-boostTemperatureOffset",
          label: "boostTemperatureOffset",
          value: this.boostTemperatureOffset,
          icon: "fire",
          min: 5,
          max: 10,
        })
        .parent()
        .toggle(this.boostEnabled);

      const pvBoostEnabledCheckbox =
        heatingControllerOptionsBuilder.createCheckboxInput({
          id: "node-input-pvBoostEnabled",
          label: "pvBoostEnabled",
          value: this.pvBoostEnabled,
          icon: "sun-o",
        });

      boostMatcherList.showHideTarget(
        this.pvBoostEnabled,
        HeatingControllerTarget.pvBoost,
      );

      const pvBoostTemperatureOffsetRow = heatingControllerOptionsBuilder
        .createNumberInput({
          id: "node-input-pvBoostTemperatureOffset",
          label: "pvBoostTemperatureOffset",
          value: this.pvBoostTemperatureOffset,
          icon: "sun-o",
          min: 0,
          max: 3,
          step: 1,
        })
        .parent()
        .toggle(this.pvBoostEnabled);

      pvBoostEnabledCheckbox.on("change", function () {
        const isChecked = $(this).is(":checked");
        pvBoostTemperatureOffsetRow.toggle(isChecked);
        boostMatcherList.removeTarget(
          isChecked,
          HeatingControllerTarget.pvBoost,
        );
      });

      heatingControllerOptionsBuilder.createNumberInput({
        id: "frostProtectionTemperature",
        label: "frostProtectionTemperature",
        value: this.frostProtectionTemperature,
        icon: "snowflake-o",
        min: 5,
        max: 9,
      });

      heatingControllerOptionsBuilder.line();

      heatingControllerOptionsBuilder.createTextInput({
        id: "node-input-comfortCommand",
        label: "comfortCommand",
        value: this.comfortCommand,
        icon: "home",
      });

      heatingControllerOptionsBuilder.createTextInput({
        id: "node-input-ecoCommand",
        label: "ecoCommand",
        value: this.ecoCommand,
        icon: "leaf",
      });

      const boostCommandRow = heatingControllerOptionsBuilder
        .createTextInput({
          id: "node-input-boostCommand",
          label: "boostCommand",
          value: this.boostCommand,
          icon: "fire",
        })
        .parent()
        .toggle(this.boostEnabled);

      boostEnabledCheckbox.on("change", function () {
        const isChecked = $(this).is(":checked");
        boostTemperatureOffsetRow.toggle(isChecked);
        boostCommandRow.toggle(isChecked);
      });

      heatingControllerOptionsBuilder.createTextInput({
        id: "node-input-frostProtectionCommand",
        label: "frostProtectionCommand",
        value: this.frostProtectionCommand,
        icon: "snowflake-o",
      });
    },
    oneditsave: function () {
      this.matchers = [
        ...controlMatcherList.values(),
        ...temperatureMatcherList.values(),
        ...boostMatcherList.values(),
      ];
    },
  };

export default HeatingControllerEditorNode;
