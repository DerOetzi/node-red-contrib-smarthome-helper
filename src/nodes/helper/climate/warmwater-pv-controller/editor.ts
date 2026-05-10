import { EditorNodeDef } from "node-red";
import WarmWaterPVControllerNode from ".";
import { ActiveControllerTarget } from "../../../flowctrl/active-controller/types";
import BaseEditorNode, {
  createEditorDefaults,
  i18n,
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
import WarmWaterPVControllerMigration from "./migration";
import {
  WarmWaterPVControllerEditorNodeProperties,
  WarmWaterPVControllerNodeOptions,
  WarmWaterPVControllerNodeOptionsDefaults,
  WarmWaterPVControllerTarget,
} from "./types";

export const WarmWaterPVControllerEditorTemplate = [
  new EditorTemplateOl("matcher-rows-general"),
  EditorTemplateLine,
  new EditorTemplateOl("matcher-rows-pv-boost"),
  EditorTemplateLine,
  new EditorTemplateDiv("warmwater-pv-controller-options"),
  ...InputEditorTemplate,
];

export const WarmWaterPVControllerEditorMetadata: EditorMetadata = {
  localePrefix: "helper.warmwater-pv-controller",
  inputMode: "matcher-topic",
  fieldKeys: [
    "defaultActive",
    "reactivateEnabled",
    "pause",
    "gridLowerThreshold",
    "gridUpperThreshold",
    "gridStabilizeTime",
    "batterySOCEnabled",
    "batterySOCThreshold",
    "outsideTempLowerThreshold",
    "outsideTempUpperThreshold",
    "currentTempEnabled",
    "currentTempThreshold",
    "surplusValue",
    "surplusValueType",
    "normalValue",
    "normalValueType",
    "surplusTemperature",
    "normalTemperature",
  ],
  inputKeys: [
    "command",
    "activeCondition",
    "manualControl",
    "gridDelivery",
    "batterySOC",
    "outsideTemperature",
    "currentWaterTemperature",
  ],
  outputKeys: ["operationMode", "targetTemperature"],
  template: WarmWaterPVControllerEditorTemplate,
};

const generalMatcherList = new MatchJoinEditableList({
  targets: [
    ActiveControllerTarget.activeCondition,
    ActiveControllerTarget.command,
    ActiveControllerTarget.manualControl,
  ],
  translatePrefix: WarmWaterPVControllerEditorMetadata.localePrefix,
  headerPrefix: WarmWaterPVControllerEditorMetadata.localePrefix,
});

const pvBoostMatcherList = new MatchJoinEditableList({
  targets: [
    WarmWaterPVControllerTarget.gridDelivery,
    WarmWaterPVControllerTarget.batterySOC,
    WarmWaterPVControllerTarget.outsideTemperature,
    WarmWaterPVControllerTarget.currentWaterTemperature,
  ],
  translatePrefix: WarmWaterPVControllerEditorMetadata.localePrefix,
  headerPrefix: WarmWaterPVControllerEditorMetadata.localePrefix,
});

const migration = new WarmWaterPVControllerMigration();

const WarmWaterPVControllerEditorNode: EditorNodeDef<WarmWaterPVControllerEditorNodeProperties> =
  {
    category: WarmWaterPVControllerNode.NodeCategoryLabel,
    color: WarmWaterPVControllerNode.NodeColor,
    icon: "font-awesome/fa-thermometer-half",
    defaults: createEditorDefaults<
      WarmWaterPVControllerNodeOptions,
      WarmWaterPVControllerEditorNodeProperties
    >(WarmWaterPVControllerNodeOptionsDefaults),
    label: function () {
      return this.name?.trim()
        ? this.name.trim()
        : i18n("helper.warmwater-pv-controller.name");
    },
    inputs: WarmWaterPVControllerNodeOptionsDefaults.inputs,
    outputs: WarmWaterPVControllerNodeOptionsDefaults.outputs,
    outputLabels: function (index: number) {
      const outputs = ["operationMode", "targetTemperature"];
      return i18n(
        `helper.warmwater-pv-controller.output.${outputs[index]}.name`,
      );
    },
    oneditprepare: function () {
      migration.checkAndMigrate(this);
      BaseEditorNode.oneditprepare!.call(this);

      generalMatcherList.initialize("matcher-rows-general", this.matchers, {
        translatePrefix: "flowctrl.match-join",
      });

      pvBoostMatcherList.initialize("matcher-rows-pv-boost", this.matchers, {
        translatePrefix: "flowctrl.match-join",
      });

      pvBoostMatcherList.showHideTarget(
        this.batterySOCEnabled,
        WarmWaterPVControllerTarget.batterySOC,
      );

      pvBoostMatcherList.showHideTarget(
        this.currentTempEnabled,
        WarmWaterPVControllerTarget.currentWaterTemperature,
      );

      const builder = new NodeEditorFormBuilder(
        $("#warmwater-pv-controller-options"),
        {
          translatePrefix: WarmWaterPVControllerEditorMetadata.localePrefix,
        },
      );

      builder.createCheckboxInput({
        id: "node-input-defaultActive",
        label: "defaultActive",
        value: this.defaultActive,
        icon: "toggle-on",
      });

      const reactivateEnabled = builder.createCheckboxInput({
        id: "node-input-reactivateEnabled",
        label: "reactivateEnabled",
        value: this.reactivateEnabled,
        icon: "toggle-on",
      });

      const pauseInputRow = builder
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

      builder.line();

      const batterySOCEnabledCheckbox = builder.createCheckboxInput({
        id: "node-input-batterySOCEnabled",
        label: "batterySOCEnabled",
        value: this.batterySOCEnabled,
        icon: "battery-full",
      });

      const batterySOCThresholdRow = builder
        .createNumberInput({
          id: "node-input-batterySOCThreshold",
          label: "batterySOCThreshold",
          value: this.batterySOCThreshold,
          icon: "battery-full",
          min: 0,
          max: 100,
        })
        .parent()
        .toggle(this.batterySOCEnabled);

      batterySOCEnabledCheckbox.on("change", function () {
        const isChecked = $(this).is(":checked");
        batterySOCThresholdRow.toggle(isChecked);
        pvBoostMatcherList.removeTarget(
          isChecked,
          WarmWaterPVControllerTarget.batterySOC,
        );
      });

      builder.line();

      builder.subHeader("surplusCondition1");

      builder.createNumberInput({
        id: "node-input-outsideTempUpperThreshold",
        label: "outsideTempUpperThreshold",
        value: this.outsideTempUpperThreshold,
        icon: "thermometer-full",
      });

      builder.createNumberInput({
        id: "node-input-gridLowerThreshold",
        label: "gridLowerThreshold",
        value: this.gridLowerThreshold,
        icon: "bolt",
        min: 0,
      });

      builder.line();

      builder.subHeader("surplusCondition2");

      builder.createNumberInput({
        id: "node-input-outsideTempLowerThreshold",
        label: "outsideTempLowerThreshold",
        value: this.outsideTempLowerThreshold,
        icon: "thermometer-half",
      });

      builder.createNumberInput({
        id: "node-input-gridUpperThreshold",
        label: "gridUpperThreshold",
        value: this.gridUpperThreshold,
        icon: "bolt",
        min: 0,
      });

      builder.createTimeInput({
        id: "node-input-gridStabilizeTime",
        idType: "node-input-gridStabilizeUnit",
        label: "gridStabilizeTime",
        value: this.gridStabilizeTime,
        valueType: this.gridStabilizeUnit,
        icon: "clock-o",
      });

      builder.line();

      const currentTempEnabledCheckbox = builder.createCheckboxInput({
        id: "node-input-currentTempEnabled",
        label: "currentTempEnabled",
        value: this.currentTempEnabled,
        icon: "shield",
      });

      const currentTempThresholdRow = builder
        .createNumberInput({
          id: "node-input-currentTempThreshold",
          label: "currentTempThreshold",
          value: this.currentTempThreshold,
          icon: "thermometer-half",
        })
        .parent()
        .toggle(this.currentTempEnabled);

      currentTempEnabledCheckbox.on("change", function () {
        const isChecked = $(this).is(":checked");
        currentTempThresholdRow.toggle(isChecked);
        pvBoostMatcherList.removeTarget(
          isChecked,
          WarmWaterPVControllerTarget.currentWaterTemperature,
        );
      });

      builder.line();

      builder.createTypedInput({
        id: "node-input-surplusValue",
        idType: "node-input-surplusValueType",
        label: "surplusValue",
        value: this.surplusValue,
        valueType: this.surplusValueType,
        icon: "sun-o",
        types: ["bool", "str"],
      });

      builder.createTypedInput({
        id: "node-input-normalValue",
        idType: "node-input-normalValueType",
        label: "normalValue",
        value: this.normalValue,
        valueType: this.normalValueType,
        icon: "home",
        types: ["bool", "str"],
      });

      builder.line();

      builder.createNumberInput({
        id: "node-input-surplusTemperature",
        label: "surplusTemperature",
        value: this.surplusTemperature,
        icon: "thermometer-full",
      });

      builder.createNumberInput({
        id: "node-input-normalTemperature",
        label: "normalTemperature",
        value: this.normalTemperature,
        icon: "thermometer-half",
      });
    },
    oneditsave: function () {
      this.matchers = [
        ...generalMatcherList.values(),
        ...pvBoostMatcherList.values(),
      ];
    },
  };

export default WarmWaterPVControllerEditorNode;
