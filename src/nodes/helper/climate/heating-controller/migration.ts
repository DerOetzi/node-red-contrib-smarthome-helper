import { EditorNodeInstance } from "node-red";
import { MatcherRow } from "../../../flowctrl/match-join/types";
import {
  HeatingControllerControllerMode,
  HeatingControllerEditorNodeProperties,
  HeatingControllerNodeOptionsDefaults,
  HeatingControllerTarget,
} from "./types";
import { ActiveControllerTarget } from "../../../flowctrl/active-controller/types";
import ActiveControllerMigration from "../../../flowctrl/active-controller/migration";
import {
  DesignTemperatureSystem,
  HeatEmitterType,
  PanelRadiatorType,
  TrvRowDefaults,
} from "./mpc/types";

const Defaults = HeatingControllerNodeOptionsDefaults;

export default class HeatingControllerMigration extends ActiveControllerMigration<HeatingControllerEditorNodeProperties> {
  protected _migrationSteps(
    node: EditorNodeInstance<HeatingControllerEditorNodeProperties>,
  ): EditorNodeInstance<HeatingControllerEditorNodeProperties> {
    node = this.applyStep(node, this.stepVersion0_21_4, "0.21.4");
    node = this.applyStep(node, this.stepVersion0_25_0, "0.25.0");
    node = this.applyStep(node, this.stepVersion0_26_0, "0.26.0");
    node = this.applyStep(node, this.stepVersion1_0_3, "1.0.3");
    node = this.applyStep(node, this.stepVersion1_1_1, "1.1.1");
    node = this.applyStep(node, this.stepVersion1_2_0, "1.2.0");
    node = this.applyStep(node, this.stepVersion1_2_6, "1.2.6");
    node = this.applyStep(node, this.stepVersion1_2_16, "1.2.16");
    node = this.applyStep(node, this.stepVersion1_2_17, "1.2.17");

    return super._migrationSteps(node);
  }

  private stepVersion0_21_4(
    node: EditorNodeInstance<HeatingControllerEditorNodeProperties>,
  ): EditorNodeInstance<HeatingControllerEditorNodeProperties> {
    node.join = false;
    node = this.migrateMatcherTargets(node);
    node = this.migrateStatusDelay(node);
    return node;
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

  private stepVersion0_25_0(
    node: EditorNodeInstance<HeatingControllerEditorNodeProperties>,
  ): EditorNodeInstance<HeatingControllerEditorNodeProperties> {
    node.defaultActive = Defaults.defaultActive;
    node.reactivateEnabled = Defaults.reactivateEnabled;
    return node;
  }

  private stepVersion0_26_0(
    node: EditorNodeInstance<HeatingControllerEditorNodeProperties>,
  ): EditorNodeInstance<HeatingControllerEditorNodeProperties> {
    node.boostEnabled = Defaults.boostEnabled;
    node.pvBoostEnabled = Defaults.pvBoostEnabled;
    node.pvBoostTemperatureOffset = Defaults.pvBoostTemperatureOffset;
    return node;
  }

  private stepVersion1_0_3(
    node: EditorNodeInstance<HeatingControllerEditorNodeProperties>,
  ): EditorNodeInstance<HeatingControllerEditorNodeProperties> {
    node.defaultComfort = node.defaultActive;
    node.defaultActive = true;
    for (const matcher of node.matchers) {
      if (matcher.target === ActiveControllerTarget.activeCondition) {
        matcher.target = HeatingControllerTarget.comfortCondition;
      }
    }
    return node;
  }

  private stepVersion1_1_1(
    node: EditorNodeInstance<HeatingControllerEditorNodeProperties>,
  ): EditorNodeInstance<HeatingControllerEditorNodeProperties> {
    node.debounceTopic = true;
    return node;
  }

  private stepVersion1_2_0(
    node: EditorNodeInstance<HeatingControllerEditorNodeProperties>,
  ): EditorNodeInstance<HeatingControllerEditorNodeProperties> {
    node.controllerMode = Defaults.controllerMode;

    node.designIndoorTemperatureC = Defaults.designIndoorTemperatureC;
    node.designOutdoorTemperatureC = Defaults.designOutdoorTemperatureC;
    node.designTemperatureSystem = Defaults.designTemperatureSystem;
    node.roomHeatLoadW = Defaults.roomHeatLoadW;

    node.mpcLearningEnabledByDefault = Defaults.mpcLearningEnabledByDefault;

    node.mpcDemandHysteresisPct = Defaults.mpcDemandHysteresisPct;
    node.mpcHoldTime = Defaults.mpcHoldTime;
    node.mpcHoldTimeUnit = Defaults.mpcHoldTimeUnit;
    node.mpcHoldOverrideDemandPct = Defaults.mpcHoldOverrideDemandPct;
    node.mpcMaxDemandStepPct = Defaults.mpcMaxDemandStepPct;

    node.trvs = Defaults.trvs.map((trv) => ({ ...trv }));
    node.roomTemperatureStrategy = Defaults.roomTemperatureStrategy;
    node.maxSensorAge = Defaults.maxSensorAge;
    node.maxSensorAgeUnit = Defaults.maxSensorAgeUnit;
    return node;
  }

  private stepVersion1_2_6(
    node: EditorNodeInstance<HeatingControllerEditorNodeProperties>,
  ): EditorNodeInstance<HeatingControllerEditorNodeProperties> {
    node.outputs =
      node.controllerMode === HeatingControllerControllerMode.mpc ? 4 : 3;
    return node;
  }

  private stepVersion1_2_16(
    node: EditorNodeInstance<HeatingControllerEditorNodeProperties>,
  ): EditorNodeInstance<HeatingControllerEditorNodeProperties> {
    node.trvs = node.trvs.map((trv) => {
      if (trv.radiatorPowerW === undefined) {
        return trv;
      }

      const estimatedWidth =
        Math.round(((trv.radiatorPowerW / 2000) * 1000) / 100) * 100;

      return {
        name: trv.name,
        minTargetTemperature: TrvRowDefaults.minTargetTemperature,
        maxTargetTemperature: TrvRowDefaults.maxTargetTemperature,
        targetTemperatureStep: TrvRowDefaults.targetTemperatureStep,
        emitterType: HeatEmitterType.panel,
        radiatorType: PanelRadiatorType.type22,
        widthMm: estimatedWidth,
        heightMm: 600,
      };
    });
    return node;
  }

  private stepVersion1_2_17(
    node: EditorNodeInstance<HeatingControllerEditorNodeProperties>,
  ): EditorNodeInstance<HeatingControllerEditorNodeProperties> {
    if (!node.designTemperatureSystem) {
      const referenceFlowTemperature = node.mpcReferenceFlowTemperature ?? 50;

      let designTemperatureSystem;

      if (referenceFlowTemperature >= 70) {
        designTemperatureSystem = DesignTemperatureSystem.system_75_65;
      } else if (referenceFlowTemperature >= 60) {
        designTemperatureSystem = DesignTemperatureSystem.system_70_55;
      } else if (referenceFlowTemperature >= 50) {
        designTemperatureSystem = DesignTemperatureSystem.system_55_45;
      } else if (referenceFlowTemperature >= 40) {
        designTemperatureSystem = DesignTemperatureSystem.system_45_35;
      } else {
        designTemperatureSystem = DesignTemperatureSystem.system_35_30;
      }

      node.designTemperatureSystem = designTemperatureSystem;
    }

    node.trvs = node.trvs.map((trv) => {
      trv.minTargetTemperature =
        node.minTargetTemperature ?? TrvRowDefaults.minTargetTemperature;
      trv.maxTargetTemperature =
        node.maxTargetTemperature ?? TrvRowDefaults.maxTargetTemperature;
      trv.targetTemperatureStep =
        node.targetTemperatureStep ?? TrvRowDefaults.targetTemperatureStep;

      return trv;
    });

    delete (node as Partial<HeatingControllerEditorNodeProperties>)
      .minTargetTemperature;

    delete (node as Partial<HeatingControllerEditorNodeProperties>)
      .maxTargetTemperature;

    delete (node as Partial<HeatingControllerEditorNodeProperties>)
      .targetTemperatureStep;

    delete (node as Partial<HeatingControllerEditorNodeProperties>)
      .mpcReferenceFlowTemperature;

    delete (node as Partial<HeatingControllerEditorNodeProperties>)
      .roomVolumeM3;

    delete (node as Partial<HeatingControllerEditorNodeProperties>)
      .airChangeRate;

    delete (node as Partial<HeatingControllerEditorNodeProperties>)
      .transmissionHeatLossExternalW;

    delete (node as Partial<HeatingControllerEditorNodeProperties>)
      .ventilationHeatLossW;

    return node;
  }
}
