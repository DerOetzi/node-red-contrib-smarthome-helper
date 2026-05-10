import { TimeIntervalUnit } from "../../../../helpers/time.helper";
import {
  ActiveControllerEditorNodeProperties,
  ActiveControllerNodeDef,
  ActiveControllerNodeOptions,
  ActiveControllerNodeOptionsDefaults,
  ActiveControllerTarget,
} from "../../../flowctrl/active-controller/types";
import { MatcherRowDefaults } from "../../../flowctrl/match-join/types";
import { NotApplicableCompareFunction } from "../../../logical/compare/types";

export enum WarmWaterPVControllerTarget {
  gridDelivery = "gridDelivery",
  batterySOC = "batterySOC",
  outsideTemperature = "outsideTemperature",
  currentWaterTemperature = "currentWaterTemperature",
}

export interface WarmWaterPVControllerNodeOptions extends ActiveControllerNodeOptions {
  gridLowerThreshold: number;
  gridUpperThreshold: number;
  gridStabilizeTime: number;
  gridStabilizeUnit: TimeIntervalUnit;

  // Battery state of charge threshold
  batterySOCEnabled: boolean;
  batterySOCThreshold: number;

  // Outside temperature thresholds
  outsideTempLowerThreshold: number;
  outsideTempUpperThreshold: number;

  // Tank temperature guard (prevents heating rod activation)
  currentTempEnabled: boolean;
  currentTempThreshold: number;

  // Output values (bool | str only)
  surplusValue: string;
  surplusValueType: "bool" | "str";
  normalValue: string;
  normalValueType: "bool" | "str";

  // Target temperatures
  surplusTemperature: number;
  normalTemperature: number;
}

export const WarmWaterPVControllerNodeOptionsDefaults: WarmWaterPVControllerNodeOptions =
  {
    ...ActiveControllerNodeOptionsDefaults,
    matchers: [
      {
        ...MatcherRowDefaults,
        target: ActiveControllerTarget.activeCondition,
        targetType: "str",
      },
      {
        ...MatcherRowDefaults,
        target: ActiveControllerTarget.manualControl,
        targetType: "str",
      },
      {
        ...MatcherRowDefaults,
        property: "command",
        operation: NotApplicableCompareFunction.notEmpty,
        target: ActiveControllerTarget.command,
        targetType: "str",
      },
      {
        ...MatcherRowDefaults,
        target: WarmWaterPVControllerTarget.gridDelivery,
        targetType: "str",
      },
      {
        ...MatcherRowDefaults,
        target: WarmWaterPVControllerTarget.batterySOC,
        targetType: "str",
      },
      {
        ...MatcherRowDefaults,
        target: WarmWaterPVControllerTarget.outsideTemperature,
        targetType: "str",
      },
      {
        ...MatcherRowDefaults,
        target: WarmWaterPVControllerTarget.currentWaterTemperature,
        targetType: "str",
      },
    ],
    outputs: 2,

    gridLowerThreshold: 3000,
    gridUpperThreshold: 5000,
    gridStabilizeTime: 15,
    gridStabilizeUnit: TimeIntervalUnit.m,

    batterySOCEnabled: true,
    batterySOCThreshold: 90,

    outsideTempLowerThreshold: 12,
    outsideTempUpperThreshold: 24,

    currentTempEnabled: true,
    currentTempThreshold: 48,

    surplusValue: "true",
    surplusValueType: "bool",
    normalValue: "false",
    normalValueType: "bool",

    surplusTemperature: 53,
    normalTemperature: 48,
  };

export interface WarmWaterPVControllerNodeDef
  extends ActiveControllerNodeDef, WarmWaterPVControllerNodeOptions {}

export interface WarmWaterPVControllerEditorNodeProperties
  extends ActiveControllerEditorNodeProperties, WarmWaterPVControllerNodeDef {}
