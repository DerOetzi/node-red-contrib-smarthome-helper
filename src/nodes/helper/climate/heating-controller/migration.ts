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
      node.mpcStepMinutes = Defaults.mpcStepMinutes;
      node.mpcHorizonSteps = Defaults.mpcHorizonSteps;
      node.mpcThermalGain = Defaults.mpcThermalGain;
      node.mpcLossCoeff = Defaults.mpcLossCoeff;
      node.mpcChangePenalty = Defaults.mpcChangePenalty;
      node.minTargetTemperature = Defaults.minTargetTemperature;
      node.maxTargetTemperature = Defaults.maxTargetTemperature;
      node.targetTemperatureStep = Defaults.targetTemperatureStep;
      node.mpcDemandHysteresisPct = Defaults.mpcDemandHysteresisPct;
      node.mpcHoldTimeSeconds = Defaults.mpcHoldTimeSeconds;
      node.mpcMaxDemandStepPct = Defaults.mpcMaxDemandStepPct;
      node.mpcReferenceFlowTemperature = Defaults.mpcReferenceFlowTemperature;
      node.mpcMinFlowFactor = Defaults.mpcMinFlowFactor;
      node.mpcMaxFlowFactor = Defaults.mpcMaxFlowFactor;
      node.trvs = Defaults.trvs;
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
