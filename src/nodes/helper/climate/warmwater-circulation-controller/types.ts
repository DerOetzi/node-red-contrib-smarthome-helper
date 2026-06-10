import {
  ActiveControllerEditorNodeProperties,
  ActiveControllerNodeDef,
  ActiveControllerNodeOptions,
  ActiveControllerNodeOptionsDefaults,
  ActiveControllerTarget,
} from "../../../flowctrl/active-controller/types";
import { MatcherRowDefaults } from "../../../flowctrl/match-join/types";
import { TimeIntervalUnit } from "../../../../helpers/time.helper";

export enum WarmwaterCirculationControllerTarget {
  heatingAvailable = "heatingAvailable",
  runCondition = "runCondition",
  specialRelease = "specialRelease",
}

export interface WarmwaterCirculationIntervalRow {
  name: string;
  from: string;
  to: string;
  onTime: number;
  onTimeUnit: TimeIntervalUnit;
  offTime: number;
  offTimeUnit: TimeIntervalUnit;
}

export interface WarmwaterCirculationControllerNodeOptions extends ActiveControllerNodeOptions {
  intervals: WarmwaterCirculationIntervalRow[];
  defaultOnTime: number;
  defaultOnTimeUnit: TimeIntervalUnit;
  defaultOffTime: number;
  defaultOffTimeUnit: TimeIntervalUnit;
  specialReleaseOffDelay: number;
  specialReleaseOffDelayUnit: TimeIntervalUnit;
}

export const WarmwaterCirculationControllerNodeOptionsDefaults: WarmwaterCirculationControllerNodeOptions =
  {
    ...ActiveControllerNodeOptionsDefaults,
    matchers: [
      {
        ...MatcherRowDefaults,
        target: WarmwaterCirculationControllerTarget.heatingAvailable,
        targetType: "str",
      },
      {
        ...MatcherRowDefaults,
        target: WarmwaterCirculationControllerTarget.runCondition,
        targetType: "str",
      },
      {
        ...MatcherRowDefaults,
        target: WarmwaterCirculationControllerTarget.specialRelease,
        targetType: "str",
      },
      {
        ...MatcherRowDefaults,
        target: ActiveControllerTarget.activeCondition,
        targetType: "str",
      },
    ],
    outputs: 1,
    intervals: [
      {
        name: "morning",
        from: "05:00",
        to: "09:00",
        onTime: 5,
        onTimeUnit: TimeIntervalUnit.m,
        offTime: 10,
        offTimeUnit: TimeIntervalUnit.m,
      },
      {
        name: "evening",
        from: "17:00",
        to: "22:00",
        onTime: 5,
        onTimeUnit: TimeIntervalUnit.m,
        offTime: 10,
        offTimeUnit: TimeIntervalUnit.m,
      },
    ],
    defaultOnTime: 2,
    defaultOnTimeUnit: TimeIntervalUnit.m,
    defaultOffTime: 13,
    defaultOffTimeUnit: TimeIntervalUnit.m,
    specialReleaseOffDelay: 15,
    specialReleaseOffDelayUnit: TimeIntervalUnit.m,
  };

export interface WarmwaterCirculationControllerNodeDef
  extends ActiveControllerNodeDef, WarmwaterCirculationControllerNodeOptions {}

export interface WarmwaterCirculationControllerEditorNodeProperties
  extends
    ActiveControllerEditorNodeProperties,
    WarmwaterCirculationControllerNodeOptions {}
