import BaseEditorNode, { i18n, NodeEditorFormBuilder } from "@base/editor";
import { MatchJoinEditableList } from "@match-join/editor";
import { EditorNodeDef } from "node-red";
import HeatingControllerNode from "./";
import { heatingControllerMigration } from "./migration";
import {
  HeatingControllerEditorNodeProperties,
  HeatingControllerEditorNodePropertiesDefaults,
  HeatingControllerNodeOptionsDefaults,
  HeatingControllerTarget,
} from "./types";

const inputMatcherList = new MatchJoinEditableList({
  targets: Object.values(HeatingControllerTarget),
  translatePrefix: "helper.heating-controller",
});

const HeatingControllerEditorNode: EditorNodeDef<HeatingControllerEditorNodeProperties> =
  {
    category: HeatingControllerNode.NodeCategoryLabel,
    color: HeatingControllerNode.NodeColor,
    icon: "font-awesome/fa-thermometer-half",
    defaults: HeatingControllerEditorNodePropertiesDefaults,
    label: function () {
      return this.name?.trim()
        ? this.name.trim()
        : i18n("helper.heating-controller.name");
    },
    inputs: HeatingControllerNodeOptionsDefaults.inputs,
    outputs: HeatingControllerNodeOptionsDefaults.outputs,
    outputLabels: function (index: number) {
      const outputs = ["heatmode", "temperature", "window"];

      return i18n(`helper.heating-controller.output.${outputs[index]}`);
    },
    onadd: function () {
      this.comfortCommand = i18n(
        "helper.heating-controller.default.comfortCommand"
      );
      this.ecoCommand = i18n("helper.heating-controller.default.ecoCommand");
      this.boostCommand = i18n(
        "helper.heating-controller.default.boostCommand"
      );
      this.frostProtectionCommand = i18n(
        "helper.heating-controller.default.frostProtectionCommand"
      );
    },
    oneditprepare: function () {
      heatingControllerMigration.checkAndMigrate(this);

      BaseEditorNode.oneditprepare!.call(this);

      inputMatcherList.initialize("matcher-rows", this.matchers, {
        translatePrefix: "flowctrl.match-join",
      });

      const heatingControllerOptionsBuilder = new NodeEditorFormBuilder(
        $("#heating-controller-options"),
        {
          translatePrefix: "helper.heating-controller",
        }
      );

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
        id: "node-input-defaultActive",
        label: "defaultActive",
        value: this.defaultActive,
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

      inputMatcherList.showHideTarget(
        this.pvBoostEnabled,
        HeatingControllerTarget.pvBoost
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
        inputMatcherList.removeTarget(
          isChecked,
          HeatingControllerTarget.pvBoost
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
      this.matchers = inputMatcherList.values();
    },
  };

export default HeatingControllerEditorNode;
