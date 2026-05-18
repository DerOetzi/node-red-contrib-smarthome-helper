import { EditorNodeInstance } from "node-red";
import { MatcherRow } from "../../../flowctrl/match-join/types";
import {
  HeatingControllerEditorNodeProperties,
  HeatingControllerNodeOptionsDefaults,
  HeatingControllerTarget,
} from "./types";
import { ActiveControllerTarget } from "../../../flowctrl/active-controller/types";
import ActiveControllerMigration from "../../../flowctrl/active-controller/migration";

const Defaults = HeatingControllerNodeOptionsDefaults;

export default class HeatingControllerMigration extends ActiveControllerMigration<HeatingControllerEditorNodeProperties> {
  protected _migrationSteps(
    node: EditorNodeInstance<HeatingControllerEditorNodeProperties>,
  ): EditorNodeInstance<HeatingControllerEditorNodeProperties> {
    if (this.checkMigrationStepRequired(node, "0.21.4")) {
      node.join = false;
      node = this.migrateMatcherTargets(node);
      node = this.migrateStatusDelay(node);
      node.migrated = true;
    }

    if (this.checkMigrationStepRequired(node, "0.25.0")) {
      node.defaultActive = Defaults.defaultActive;
      node.reactivateEnabled = Defaults.reactivateEnabled;
      node.migrated = true;
    }

    if (this.checkMigrationStepRequired(node, "0.26.0")) {
      node.boostEnabled = Defaults.boostEnabled;
      node.pvBoostEnabled = Defaults.pvBoostEnabled;
      node.pvBoostTemperatureOffset = Defaults.pvBoostTemperatureOffset;
      node.migrated = true;
    }

    if (this.checkMigrationStepRequired(node, "0.27.1")) {
      node.outputs = Defaults.outputs;
      node.migrated = true;
    }

    if (this.checkMigrationStepRequired(node, "1.0.3")) {
      node.defaultComfort = node.defaultActive;
      node.defaultActive = true;
      for (const matcher of node.matchers) {
        if (matcher.target === ActiveControllerTarget.activeCondition) {
          matcher.target = HeatingControllerTarget.comfortCondition;
        }
      }

      node.migrated = true;
    }

    if (this.checkMigrationStepRequired(node, "1.1.1")) {
      node.debounceTopic = true;
      node.migrated = true;
    }

    if (this.checkMigrationStepRequired(node, "1.2.3")) {
      node.controllerMode = Defaults.controllerMode;

      node.designIndoorTemperatureC = Defaults.designIndoorTemperatureC;
      node.designOutdoorTemperatureC = Defaults.designOutdoorTemperatureC;

      node.roomHeatLoadW = Defaults.roomHeatLoadW;
      node.roomVolumeM3 = Defaults.roomVolumeM3;
      node.airChangeRate = Defaults.airChangeRate;
      node.transmissionHeatLossExternalW =
        Defaults.transmissionHeatLossExternalW;
      node.ventilationHeatLossW = Defaults.ventilationHeatLossW;

      node.mpcLearningEnabledByDefault = Defaults.mpcLearningEnabledByDefault;

      node.mpcReferenceFlowTemperature = Defaults.mpcReferenceFlowTemperature;

      node.mpcDemandHysteresisPct = Defaults.mpcDemandHysteresisPct;
      node.mpcHoldTime = Defaults.mpcHoldTime;
      node.mpcHoldTimeUnit = Defaults.mpcHoldTimeUnit;
      node.mpcHoldOverrideDemandPct = Defaults.mpcHoldOverrideDemandPct;
      node.mpcMaxDemandStepPct = Defaults.mpcMaxDemandStepPct;

      node.minTargetTemperature = Defaults.minTargetTemperature;
      node.maxTargetTemperature = Defaults.maxTargetTemperature;
      node.targetTemperatureStep = Defaults.targetTemperatureStep;

      node.trvs = Defaults.trvs.map((trv) => ({ ...trv }));
      node.roomTemperatureStrategy = Defaults.roomTemperatureStrategy;
      node.maxSensorAge = Defaults.maxSensorAge;
      node.maxSensorAgeUnit = Defaults.maxSensorAgeUnit;

      node.migrated = true;
    }

    return super._migrationSteps(node);
  }

  private migrateMatcherTargets(
    node: EditorNodeInstance<HeatingControllerEditorNodeProperties>,
  ): EditorNodeInstance<HeatingControllerEditorNodeProperties> {
    node.matchers = node.matchers.map((matcher: MatcherRow) => {
      if (matcher.target === "manual_control") {
        matcher.target = ActiveControllerTarget.manualControl;
      }

      return matcher;
    });

    return node;
  }

  private migrateStatusDelay(
    node: EditorNodeInstance<HeatingControllerEditorNodeProperties>,
  ): EditorNodeInstance<HeatingControllerEditorNodeProperties> {
    if (node.statusDelay) {
      delete node.statusDelay;
    }
    return node;
  }
}
