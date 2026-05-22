import { ActiveControllerTarget } from "../../../flowctrl/active-controller/types";
import {
  i18nFieldDefault,
  NodeEditorDefinition,
  NodeEditorFormBuilder,
  NodeEditorFormEditableList,
} from "../../../flowctrl/base/editor";
import { MatchJoinEditableList } from "../../../flowctrl/match-join/editor";
import HeatingControllerNode from "./";
import {
  DesignTemperatureSystem,
  HeatEmitterType,
  RoomTemperatureStrategy,
  TRV_MAX_COUNT,
  TrvRow,
  TrvRowDefaults,
} from "./mpc/types";
import {
  HeatingControllerControllerMode,
  HeatingControllerEditorNodeProperties,
  HeatingControllerNodeOptions,
  HeatingControllerNodeOptionsDefaults,
  HeatingControllerTarget,
} from "./types";

class TrvListEditableList extends NodeEditorFormEditableList<TrvRow> {
  protected addItem(data: TrvRow) {
    this.rowBuilder!.createTextInput({
      id: "name",
      label: "trvName",
      value: data.name ?? "",
      icon: "tag",
    });

    this.rowBuilder!.createNumberInput({
      id: "minTargetTemperature",
      label: "minTargetTemperature",
      value: data.minTargetTemperature ?? TrvRowDefaults.minTargetTemperature,
      min: 5,
      max: 10,
      step: 0.5,
      icon: "arrow-down",
    });

    this.rowBuilder!.createNumberInput({
      id: "maxTargetTemperature",
      label: "maxTargetTemperature",
      value: data.maxTargetTemperature ?? TrvRowDefaults.maxTargetTemperature,
      min: 15,
      max: 35,
      step: 0.5,
      icon: "arrow-up",
    });

    this.rowBuilder!.createNumberInput({
      id: "targetTemperatureStep",
      label: "targetTemperatureStep",
      value: data.targetTemperatureStep ?? TrvRowDefaults.targetTemperatureStep,
      min: 0.5,
      max: 2,
      step: 0.5,
      icon: "step-forward",
    });

    const heatEmitterTypeSelect = this.rowBuilder!.createSelectInput({
      id: "emitterType",
      label: "heatEmitterType",
      value: data.emitterType,
      options: [HeatEmitterType.panel, HeatEmitterType.towel],
      icon: "thermometer",
    });

    const radiatorTypeRow = this.rowBuilder!.createSelectInput({
      id: "radiatorType",
      label: "radiatorType",
      value: data.radiatorType,
      options: ["10", "11", "21", "22", "33"],
      icon: "thermometer",
    }).parent();

    const widthMmRow = this.rowBuilder!.createNumberInput({
      id: "widthMm",
      label: "widthMm",
      value: data.widthMm ?? 1000,
      min: 200,
      max: 3000,
      step: 50,
      icon: "arrows-h",
    }).parent();

    const heightMmRow = this.rowBuilder!.createNumberInput({
      id: "heightMm",
      label: "heightMm",
      value: data.heightMm ?? 600,
      min: 200,
      max: 1200,
      step: 50,
      icon: "arrows-v",
    }).parent();

    const nominalPowerWRow = this.rowBuilder!.createNumberInput({
      id: "nominalPowerW",
      label: "nominalPowerW",
      value: data.nominalPowerW,
      min: 100,
      max: 3000,
      step: 10,
      icon: "bolt",
    }).parent();

    const updateHeatEmitterFieldVisibility = () => {
      const emitterType =
        (heatEmitterTypeSelect.val() as HeatEmitterType) ??
        HeatEmitterType.panel;
      const isPanelEmitter = emitterType === HeatEmitterType.panel;

      radiatorTypeRow.toggle(isPanelEmitter);
      widthMmRow.toggle(isPanelEmitter);
      heightMmRow.toggle(isPanelEmitter);
      nominalPowerWRow.toggle(!isPanelEmitter);
    };

    updateHeatEmitterFieldVisibility();

    heatEmitterTypeSelect.on("change", updateHeatEmitterFieldVisibility);
  }
}

const controlMatcherList = new MatchJoinEditableList({
  targets: [
    ActiveControllerTarget.activeCondition,
    HeatingControllerTarget.comfortCondition,
    ActiveControllerTarget.manualControl,
    ActiveControllerTarget.command,
    HeatingControllerTarget.windowOpen,
    HeatingControllerTarget.heatingAvailable,
    HeatingControllerTarget.mpcLearningRecalibrate,
  ],
  translatePrefix: "helper.heating-controller",
  headerPrefix: "helper.heating-controller",
});

const temperatureMatcherList = new MatchJoinEditableList({
  targets: [
    HeatingControllerTarget.comfortTemperature,
    HeatingControllerTarget.ecoTemperatureOffset,
    HeatingControllerTarget.trv1,
    HeatingControllerTarget.trv2,
    HeatingControllerTarget.trv3,
    HeatingControllerTarget.additionalTemperatureSensor,
    HeatingControllerTarget.outdoorTemperature,
    HeatingControllerTarget.flowTemperature,
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
    })
    .parent()
    .toggle(node.pvBoostEnabled);

  pvBoostEnabledCheckbox.on("change", function () {
    const isChecked = $(this).is(":checked");
    pvBoostTemperatureOffsetRow.toggle(isChecked);
    boostMatcherList.removeTarget(isChecked, HeatingControllerTarget.pvBoost);
  });

  builder.createNumberInput({
    id: "node-input-frostProtectionTemperature",
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

  builder.line();

  const isMpc = node.controllerMode === HeatingControllerControllerMode.mpc;

  controlMatcherList.showHideTarget(
    isMpc,
    HeatingControllerTarget.mpcLearningRecalibrate,
  );

  const controllerModeSelect = builder.createSelectInput({
    id: "node-input-controllerMode",
    label: "controllerMode",
    value: node.controllerMode,
    icon: "cog",
    options: [
      HeatingControllerControllerMode.static,
      HeatingControllerControllerMode.mpc,
    ],
  });

  const designIndoorTemperatureCRow = builder
    .createNumberInput({
      id: "node-input-designIndoorTemperatureC",
      label: "designIndoorTemperatureC",
      value: node.designIndoorTemperatureC,
      icon: "home",
      min: 10,
      max: 30,
      step: 0.1,
    })
    .parent()
    .toggle(isMpc);

  const designOutdoorTemperatureCRow = builder
    .createNumberInput({
      id: "node-input-designOutdoorTemperatureC",
      label: "designOutdoorTemperatureC",
      value: node.designOutdoorTemperatureC,
      icon: "snowflake-o",
      min: -30,
      max: 20,
      step: 0.1,
    })
    .parent()
    .toggle(isMpc);

  const designTemperatureSystemRow = builder
    .createSelectInput({
      id: "node-input-designTemperatureSystem",
      label: "designTemperatureSystem",
      value: node.designTemperatureSystem,
      icon: "thermometer-half",
      options: Object.values(DesignTemperatureSystem),
    })
    .parent()
    .toggle(isMpc);

  const roomHeatLoadWRow = builder
    .createNumberInput({
      id: "node-input-roomHeatLoadW",
      label: "roomHeatLoadW",
      value: node.roomHeatLoadW,
      icon: "fire",
      min: 100,
      max: 10000,
    })
    .parent()
    .toggle(isMpc);

  const mpcDemandHysteresisPctRow = builder
    .createNumberInput({
      id: "node-input-mpcDemandHysteresisPct",
      label: "mpcDemandHysteresisPct",
      value: node.mpcDemandHysteresisPct,
      icon: "adjust",
      min: 0,
      max: 30,
    })
    .parent()
    .toggle(isMpc);

  const mpcHoldTimeRow = builder
    .createTimeInput({
      id: "node-input-mpcHoldTime",
      idType: "node-input-mpcHoldTimeUnit",
      label: "mpcHoldTime",
      value: node.mpcHoldTime,
      valueType: node.mpcHoldTimeUnit,
      icon: "clock-o",
    })
    .parent()
    .toggle(isMpc);

  const mpcHoldOverrideDemandPctRow = builder
    .createNumberInput({
      id: "node-input-mpcHoldOverrideDemandPct",
      label: "mpcHoldOverrideDemandPct",
      value: node.mpcHoldOverrideDemandPct,
      icon: "bolt",
      min: 0,
      max: 100,
    })
    .parent()
    .toggle(isMpc);

  const mpcMaxDemandStepPctRow = builder
    .createNumberInput({
      id: "node-input-mpcMaxDemandStepPct",
      label: "mpcMaxDemandStepPct",
      value: node.mpcMaxDemandStepPct,
      icon: "arrows-v",
      min: 5,
      max: 100,
    })
    .parent()
    .toggle(isMpc);

  const mpcLearningEnabledByDefaultRow = builder
    .createCheckboxInput({
      id: "node-input-mpcLearningEnabledByDefault",
      label: "mpcLearningEnabledByDefault",
      value: node.mpcLearningEnabledByDefault,
      icon: "graduation-cap",
    })
    .parent()
    .toggle(isMpc);

  builder.line();

  const roomTemperatureStrategyRow = builder
    .createSelectInput({
      id: "node-input-roomTemperatureStrategy",
      label: "roomTemperatureStrategy",
      value: node.roomTemperatureStrategy,
      icon: "thermometer-half",
      options: [
        RoomTemperatureStrategy.external,
        RoomTemperatureStrategy.average_trv,
        RoomTemperatureStrategy.median_trv,
      ],
    })
    .parent()
    .toggle(isMpc);

  const maxSensorAgeRow = builder
    .createTimeInput({
      id: "node-input-maxSensorAge",
      idType: "node-input-maxSensorAgeUnit",
      label: "maxSensorAge",
      value: node.maxSensorAge,
      valueType: node.maxSensorAgeUnit,
      icon: "clock-o",
    })
    .parent()
    .toggle(isMpc);

  const outputsInput = builder.createHiddenInput({
    id: "node-input-outputs",
    value: node.outputs,
  });

  controllerModeSelect.on("change", function () {
    const mpcSelected = $(this).val() === HeatingControllerControllerMode.mpc;
    designIndoorTemperatureCRow.toggle(mpcSelected);
    designOutdoorTemperatureCRow.toggle(mpcSelected);
    designTemperatureSystemRow.toggle(mpcSelected);
    roomHeatLoadWRow.toggle(mpcSelected);
    mpcLearningEnabledByDefaultRow.toggle(mpcSelected);
    mpcDemandHysteresisPctRow.toggle(mpcSelected);
    mpcHoldTimeRow.toggle(mpcSelected);
    mpcHoldOverrideDemandPctRow.toggle(mpcSelected);
    mpcMaxDemandStepPctRow.toggle(mpcSelected);
    roomTemperatureStrategyRow.toggle(mpcSelected);
    maxSensorAgeRow.toggle(mpcSelected);

    controlMatcherList.removeTarget(
      mpcSelected,
      HeatingControllerTarget.mpcLearningRecalibrate,
    );

    outputsInput.val(mpcSelected ? 4 : 3);
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
    "controllerMode",
    "designIndoorTemperatureC",
    "designOutdoorTemperatureC",
    "designTemperatureSystem",
    "roomHeatLoadW",
    "mpcLearningEnabledByDefault",
    "mpcDemandHysteresisPct",
    "mpcHoldTime",
    "mpcHoldTimeUnit",
    "mpcHoldOverrideDemandPct",
    "mpcMaxDemandStepPct",
    "roomTemperatureStrategy",
    "maxSensorAge",
    "maxSensorAgeUnit",
  ],
  inputKeys: [
    "activeCondition",
    "comfortTemperature",
    "ecoTemperatureOffset",
    "windowOpen",
    "manualControl",
    "command",
    "mpcLearningRecalibrate",
    "pvBoost",
    "pvBoostTemperatureOffset",
    "heatingAvailable",
    "trv1",
    "trv2",
    "trv3",
    "additionalTemperatureSensor",
    "outdoorTemperature",
    "flowTemperature",
  ],
  outputKeys: ["heatmode", "temperature", "window", "persistLearningFactors"],
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
    {
      id: "trv-rows",
      create: () => new TrvListEditableList(),
      dataKey: "trvs",
      rowTranslatePrefix: "helper.heating-controller",
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
    oneditprepare(node, ctx) {
      const matcherList = ctx.getList("matcher-rows-temperature");
      const trvListCtx = ctx.getList("trv-rows");

      function updateMatcherVisibilityForTrvCount() {
        const trvCount = trvListCtx.values().length;
        for (let i = 1; i <= TRV_MAX_COUNT; i++) {
          matcherList.removeTarget?.(i <= trvCount, `trv${i}`);
        }
      }

      for (let i = 1; i <= TRV_MAX_COUNT; i++) {
        matcherList.showHideTarget?.(i <= node.trvs.length, `trv${i}`);
      }

      $("#trv-rows").on("change", () => updateMatcherVisibilityForTrvCount());
    },
  },
};
