import { TimeIntervalUnit } from "../../../../helpers/time.helper";
import { MatcherRowDefaults } from "../../../flowctrl/match-join/types";
import { NotApplicableCompareFunction } from "../../../logical/compare/types";
import {
  ActiveControllerEditorNodeProperties,
  ActiveControllerNodeDef,
  ActiveControllerNodeOptions,
  ActiveControllerNodeOptionsDefaults,
  ActiveControllerTarget,
} from "../../../flowctrl/active-controller/types";

export enum MotionControllerTarget {
  motion = "motion",
  darkness = "darkness",
  night = "night",
}

export interface MotionControllerNodeOptions extends ActiveControllerNodeOptions {
  timer: number;
  timerUnit: TimeIntervalUnit;
  onlyDarkness: boolean;
  nightmodeEnabled: boolean;
  onCommand?: string;
  offCommand?: string;
  nightmodeCommand?: string;

  //deprecated since 0.21.3
  statusDelay?: number;
}

export const MotionControllerNodeOptionsDefaults: MotionControllerNodeOptions =
  {
    ...ActiveControllerNodeOptionsDefaults,
    matchers: [
      {
        ...MatcherRowDefaults,
        target: MotionControllerTarget.motion,
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
        target: ActiveControllerTarget.manualControl,
        targetType: "str",
      },
    ],
    timer: 30,
    timerUnit: TimeIntervalUnit.s,
    nightmodeEnabled: false,
    onlyDarkness: false,
    onCommand: "",
    offCommand: "",
    nightmodeCommand: "",
  };

export interface MotionControllerNodeDef
  extends ActiveControllerNodeDef, MotionControllerNodeOptions {}

export interface MotionControllerEditorNodeProperties
  extends ActiveControllerEditorNodeProperties, MotionControllerNodeOptions {}
