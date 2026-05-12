import WarmWaterPVControllerNode from ".";
import { ActiveControllerTarget } from "../../../flowctrl/active-controller/types";
import {
  buildEditorMetadata,
  buildEditorNodeDef,
  buildEditorTemplate,
  NodeEditorDefinition,
  NodeEditorFormBuilder,
} from "../../../flowctrl/base/editor";
import { MatchJoinEditableList } from "../../../flowctrl/match-join/editor";
import WarmWaterPVControllerMigration from "./migration";
import {
  WarmWaterPVControllerEditorNodeProperties,
  WarmWaterPVControllerNodeOptions,
  WarmWaterPVControllerNodeOptionsDefaults,
  WarmWaterPVControllerTarget,
} from "./types";

const generalMatcherList = new MatchJoinEditableList({
  targets: [
    ActiveControllerTarget.activeCondition,
    ActiveControllerTarget.command,
    ActiveControllerTarget.manualControl,
  ],
  translatePrefix: "helper.warmwater-pv-controller",
  headerPrefix: "helper.warmwater-pv-controller",
});

const pvBoostMatcherList = new MatchJoinEditableList({
  targets: [
    WarmWaterPVControllerTarget.gridDelivery,
    WarmWaterPVControllerTarget.batterySOC,
    WarmWaterPVControllerTarget.outsideTemperature,
    WarmWaterPVControllerTarget.currentWaterTemperature,
  ],
  translatePrefix: "helper.warmwater-pv-controller",
  headerPrefix: "helper.warmwater-pv-controller",
});

const migration = new WarmWaterPVControllerMigration();

function buildWarmWaterPVControllerFormContent(
  node: WarmWaterPVControllerEditorNodeProperties,
): void {
  const builder = new NodeEditorFormBuilder(
    $("#warmwater-pv-controller-options"),
    { translatePrefix: "helper.warmwater-pv-controller" },
  );

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

  builder.line();

  const batterySOCEnabledCheckbox = builder.createCheckboxInput({
    id: "node-input-batterySOCEnabled",
    label: "batterySOCEnabled",
    value: node.batterySOCEnabled,
    icon: "battery-full",
  });

  const batterySOCThresholdRow = builder
    .createNumberInput({
      id: "node-input-batterySOCThreshold",
      label: "batterySOCThreshold",
      value: node.batterySOCThreshold,
      icon: "battery-full",
      min: 0,
      max: 100,
    })
    .parent()
    .toggle(node.batterySOCEnabled);

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
    value: node.outsideTempUpperThreshold,
    icon: "thermometer-full",
  });

  builder.createNumberInput({
    id: "node-input-gridLowerThreshold",
    label: "gridLowerThreshold",
    value: node.gridLowerThreshold,
    icon: "bolt",
    min: 0,
  });

  builder.line();

  builder.subHeader("surplusCondition2");

  builder.createNumberInput({
    id: "node-input-outsideTempLowerThreshold",
    label: "outsideTempLowerThreshold",
    value: node.outsideTempLowerThreshold,
    icon: "thermometer-half",
  });

  builder.createNumberInput({
    id: "node-input-gridUpperThreshold",
    label: "gridUpperThreshold",
    value: node.gridUpperThreshold,
    icon: "bolt",
    min: 0,
  });

  builder.createTimeInput({
    id: "node-input-gridStabilizeTime",
    idType: "node-input-gridStabilizeUnit",
    label: "gridStabilizeTime",
    value: node.gridStabilizeTime,
    valueType: node.gridStabilizeUnit,
    icon: "clock-o",
  });

  builder.line();

  const currentTempEnabledCheckbox = builder.createCheckboxInput({
    id: "node-input-currentTempEnabled",
    label: "currentTempEnabled",
    value: node.currentTempEnabled,
    icon: "shield",
  });

  const currentTempThresholdRow = builder
    .createNumberInput({
      id: "node-input-currentTempThreshold",
      label: "currentTempThreshold",
      value: node.currentTempThreshold,
      icon: "thermometer-half",
    })
    .parent()
    .toggle(node.currentTempEnabled);

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
    value: node.surplusValue,
    valueType: node.surplusValueType,
    icon: "sun-o",
    types: ["bool", "str"],
  });

  builder.createTypedInput({
    id: "node-input-normalValue",
    idType: "node-input-normalValueType",
    label: "normalValue",
    value: node.normalValue,
    valueType: node.normalValueType,
    icon: "home",
    types: ["bool", "str"],
  });

  builder.line();

  builder.createNumberInput({
    id: "node-input-surplusTemperature",
    label: "surplusTemperature",
    value: node.surplusTemperature,
    icon: "thermometer-full",
  });

  builder.createNumberInput({
    id: "node-input-normalTemperature",
    label: "normalTemperature",
    value: node.normalTemperature,
    icon: "thermometer-half",
  });

  pvBoostMatcherList.showHideTarget(
    node.batterySOCEnabled,
    WarmWaterPVControllerTarget.batterySOC,
  );

  pvBoostMatcherList.showHideTarget(
    node.currentTempEnabled,
    WarmWaterPVControllerTarget.currentWaterTemperature,
  );
}

const def: NodeEditorDefinition<
  WarmWaterPVControllerNodeOptions,
  WarmWaterPVControllerEditorNodeProperties
> = {
  localePrefix: "helper.warmwater-pv-controller",
  nodeClass: WarmWaterPVControllerNode,
  defaults: WarmWaterPVControllerNodeOptionsDefaults,
  icon: "font-awesome/fa-thermometer-half",
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
  baseTemplate: "input-only",
  lists: [
    {
      id: "matcher-rows-general",
      create: () => generalMatcherList,
      dataKey: "matchers",
      rowTranslatePrefix: "flowctrl.match-join",
    },
    {
      id: "matcher-rows-pv-boost",
      create: () => pvBoostMatcherList,
      dataKey: "matchers",
      rowTranslatePrefix: "flowctrl.match-join",
    },
  ],
  form: {
    id: "warmwater-pv-controller-options",
    build: buildWarmWaterPVControllerFormContent,
  },
  hooks: {
    oneditprepare: (node) => {
      migration.checkAndMigrate(node);
    },
  },
};

export const WarmWaterPVControllerEditorTemplate = buildEditorTemplate(def);
export const WarmWaterPVControllerEditorMetadata = buildEditorMetadata(def);
export default buildEditorNodeDef(def);
