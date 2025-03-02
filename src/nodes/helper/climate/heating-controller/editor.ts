import { EditorNodeDef } from "node-red";
import BaseEditorNode, {
  i18n,
  NodeEditorFormBuilder,
} from "../../../flowctrl/base/editor";
import { MatchJoinEditableList } from "../../../flowctrl/match-join/editor";
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
      return this.name || i18n("helper.heating-controller.name");
    },
    inputs: HeatingControllerNodeOptionsDefaults.inputs,
    outputs: HeatingControllerNodeOptionsDefaults.outputs,
    outputLabels: function (index: number) {
      const outputs = ["heatmode", "temperature", "window", "status"];

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

      heatingControllerOptionsBuilder.createNumberInput({
        id: "node-input-boostTemperatureOffset",
        label: "boostTemperatureOffset",
        value: this.boostTemperatureOffset,
        icon: "fire",
        min: 5,
        max: 10,
      });

      heatingControllerOptionsBuilder.createNumberInput({
        id: "frostProtectionTemperature",
        label: "frostProtectionTemperature",
        value: this.frostProtectionTemperature,
        icon: "snowflake-o",
        min: 5,
        max: 9,
      });

      heatingControllerOptionsBuilder.createTimeInput({
        id: "node-input-initializeDelay",
        idType: "node-input-initializeDelayUnit",
        label: "initializeDelay",
        value: this.initializeDelay,
        valueType: this.initializeDelayUnit,
        icon: "pause",
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

      heatingControllerOptionsBuilder.createTextInput({
        id: "node-input-boostCommand",
        label: "boostCommand",
        value: this.boostCommand,
        icon: "fire",
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
