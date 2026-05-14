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
  HeatingControllerControllerMode,
  HeatingControllerEditorNodeProperties,
  HeatingControllerNodeOptions,
  HeatingControllerNodeOptionsDefaults,
  HeatingControllerTarget,
  TRV_MAX_COUNT,
  TrvRow,
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
      id: "powerFactor",
      label: "trvPowerFactor",
      value: data.powerFactor ?? 1,
      icon: "tachometer",
      min: 0.1,
      max: 3,
      step: 0.1,
    });
  }
}

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

  builder.line();

  const isMpc = node.controllerMode === HeatingControllerControllerMode.mpc;

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

  const mpcStepMinutesRow = builder
    .createNumberInput({
      id: "node-input-mpcStepMinutes",
      label: "mpcStepMinutes",
      value: node.mpcStepMinutes,
      icon: "clock-o",
      min: 1,
      max: 60,
    })
    .parent()
    .toggle(isMpc);

  const mpcHorizonStepsRow = builder
    .createNumberInput({
      id: "node-input-mpcHorizonSteps",
      label: "mpcHorizonSteps",
      value: node.mpcHorizonSteps,
      icon: "forward",
      min: 1,
      max: 24,
    })
    .parent()
    .toggle(isMpc);

  const mpcThermalGainRow = builder
    .createNumberInput({
      id: "node-input-mpcThermalGain",
      label: "mpcThermalGain",
      value: node.mpcThermalGain,
      icon: "fire",
      step: 0.01,
    })
    .parent()
    .toggle(isMpc);

  const mpcLossCoeffRow = builder
    .createNumberInput({
      id: "node-input-mpcLossCoeff",
      label: "mpcLossCoeff",
      value: node.mpcLossCoeff,
      icon: "minus-circle",
      step: 0.001,
    })
    .parent()
    .toggle(isMpc);

  const mpcChangePenaltyRow = builder
    .createNumberInput({
      id: "node-input-mpcChangePenalty",
      label: "mpcChangePenalty",
      value: node.mpcChangePenalty,
      icon: "balance-scale",
      step: 0.01,
    })
    .parent()
    .toggle(isMpc);

  const minTargetTemperatureRow = builder
    .createNumberInput({
      id: "node-input-minTargetTemperature",
      label: "minTargetTemperature",
      value: node.minTargetTemperature,
      icon: "thermometer-empty",
      min: 0,
      max: 15,
    })
    .parent()
    .toggle(isMpc);

  const maxTargetTemperatureRow = builder
    .createNumberInput({
      id: "node-input-maxTargetTemperature",
      label: "maxTargetTemperature",
      value: node.maxTargetTemperature,
      icon: "thermometer-full",
      min: 15,
      max: 35,
    })
    .parent()
    .toggle(isMpc);

  const targetTemperatureStepRow = builder
    .createNumberInput({
      id: "node-input-targetTemperatureStep",
      label: "targetTemperatureStep",
      value: node.targetTemperatureStep,
      icon: "step-forward",
      min: 0.5,
      max: 2,
      step: 0.5,
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
      step: 1,
    })
    .parent()
    .toggle(isMpc);

  const mpcHoldTimeSecondsRow = builder
    .createNumberInput({
      id: "node-input-mpcHoldTimeSeconds",
      label: "mpcHoldTimeSeconds",
      value: node.mpcHoldTimeSeconds,
      icon: "clock-o",
      min: 0,
      max: 3600,
      step: 30,
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
      step: 5,
    })
    .parent()
    .toggle(isMpc);

  const mpcReferenceFlowTemperatureRow = builder
    .createNumberInput({
      id: "node-input-mpcReferenceFlowTemperature",
      label: "mpcReferenceFlowTemperature",
      value: node.mpcReferenceFlowTemperature,
      icon: "tint",
      min: 20,
      max: 90,
      step: 5,
    })
    .parent()
    .toggle(isMpc);

  const mpcMinFlowFactorRow = builder
    .createNumberInput({
      id: "node-input-mpcMinFlowFactor",
      label: "mpcMinFlowFactor",
      value: node.mpcMinFlowFactor,
      icon: "minus",
      min: 0.1,
      max: 1,
      step: 0.1,
    })
    .parent()
    .toggle(isMpc);

  const mpcMaxFlowFactorRow = builder
    .createNumberInput({
      id: "node-input-mpcMaxFlowFactor",
      label: "mpcMaxFlowFactor",
      value: node.mpcMaxFlowFactor,
      icon: "plus",
      min: 1,
      max: 3,
      step: 0.1,
    })
    .parent()
    .toggle(isMpc);

  controllerModeSelect.on("change", function () {
    const mpcSelected = $(this).val() === HeatingControllerControllerMode.mpc;
    mpcStepMinutesRow.toggle(mpcSelected);
    mpcHorizonStepsRow.toggle(mpcSelected);
    mpcThermalGainRow.toggle(mpcSelected);
    mpcLossCoeffRow.toggle(mpcSelected);
    mpcChangePenaltyRow.toggle(mpcSelected);
    mpcDemandHysteresisPctRow.toggle(mpcSelected);
    mpcHoldTimeSecondsRow.toggle(mpcSelected);
    mpcMaxDemandStepPctRow.toggle(mpcSelected);
    mpcReferenceFlowTemperatureRow.toggle(mpcSelected);
    mpcMinFlowFactorRow.toggle(mpcSelected);
    mpcMaxFlowFactorRow.toggle(mpcSelected);
    minTargetTemperatureRow.toggle(mpcSelected);
    maxTargetTemperatureRow.toggle(mpcSelected);
    targetTemperatureStepRow.toggle(mpcSelected);
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
    "mpcStepMinutes",
    "mpcHorizonSteps",
    "mpcThermalGain",
    "mpcLossCoeff",
    "mpcChangePenalty",
    "mpcDemandHysteresisPct",
    "mpcHoldTimeSeconds",
    "mpcMaxDemandStepPct",
    "mpcReferenceFlowTemperature",
    "mpcMinFlowFactor",
    "mpcMaxFlowFactor",
    "minTargetTemperature",
    "maxTargetTemperature",
    "targetTemperatureStep",
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
    "trv1",
    "trv2",
    "trv3",
    "additionalTemperatureSensor",
    "outdoorTemperature",
    "flowTemperature",
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
    oneditsave(node, ctx) {
      const trvListCtx = ctx.getList("trv-rows");
      const trvs = trvListCtx.values() as Array<{
        name: string;
        powerFactor: number;
      }>;

      const namedTrvs = trvs
        .filter((t) => t.name && t.name.trim().length > 0)
        .map((t) => ({ ...t, name: t.name.trim() }));

      const names = namedTrvs.map((t) => t.name);
      const unique = new Set(names);
      if (unique.size < names.length) {
        const seen = new Set<string>();
        node.trvs = namedTrvs.filter((t) => {
          if (seen.has(t.name)) {
            return false;
          }
          seen.add(t.name);
          return true;
        });
      } else {
        node.trvs = namedTrvs;
      }

      node.trvs = node.trvs.map((t) => ({
        ...t,
        powerFactor: Math.max(0.1, Math.min(3, t.powerFactor ?? 1)),
      }));
    },
  },
};
