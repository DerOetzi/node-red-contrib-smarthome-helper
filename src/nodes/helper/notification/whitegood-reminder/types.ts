import { TimeIntervalUnit } from "../../../../helpers/time.helper";
import {
  InputNodeOptionsDefaults,
  MatcherRowDefaults,
  MatchJoinEditorNodeProperties,
  MatchJoinNodeDef,
  MatchJoinNodeOptions,
} from "../../../flowctrl/match-join/types";

export enum WhitegoodReminderTarget {
  power = "power",
  runs = "runs",
  emptied = "emptied",
}

export enum WhitegoodStatus {
  off = "off",
  standby = "standby",
  running = "running",
  unemptied = "unemptied",
}

export interface WhitegoodReminderNodeOptions extends MatchJoinNodeOptions {
  offPowerLimit: number;
  standbyPowerLimit: number;
  cleanupEnabled: boolean;
  cleanupInterval: number;
  statusShowRuns: boolean;
  emptyReminderEnabled: boolean;
  emptyReminderInterval: number;
  emptyReminderUnit: TimeIntervalUnit;
}

export const WhitegoodReminderNodeOptionsDefaults: WhitegoodReminderNodeOptions =
  {
    ...InputNodeOptionsDefaults,
    matchers: [
      {
        ...MatcherRowDefaults,
        target: WhitegoodReminderTarget.power,
        targetType: "str",
      },
    ],
    offPowerLimit: 0.1,
    standbyPowerLimit: 0.5,
    cleanupEnabled: false,
    cleanupInterval: 30,
    emptyReminderEnabled: false,
    emptyReminderInterval: 30,
    emptyReminderUnit: TimeIntervalUnit.m,
    statusShowRuns: false,
    outputs: 2,
  };

export interface WhitegoodReminderNodeDef
  extends MatchJoinNodeDef, WhitegoodReminderNodeOptions {}

export interface WhitegoodReminderEditorNodeProperties
  extends MatchJoinEditorNodeProperties, WhitegoodReminderNodeOptions {}
