import { EditorNodePropertiesDef } from "node-red";
import { TimeIntervalUnit } from "../../../../helpers/time.helper";
import {
  BaseEditorNodePropertiesDefaults,
  BaseNodeOptionsDefaults,
} from "../../../flowctrl/base/types";
import {
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
    ...BaseNodeOptionsDefaults,
    matchers: [
      {
        ...MatcherRowDefaults,
        target: WhitegoodReminderTarget.power,
        targetType: "str",
      },
    ],
    join: false,
    minMsgCount: 1,
    discardNotMatched: true,
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
  extends MatchJoinNodeDef,
    WhitegoodReminderNodeOptions {}

export interface WhitegoodReminderEditorNodeProperties
  extends MatchJoinEditorNodeProperties,
    WhitegoodReminderNodeOptions {}

export const WhitegoodReminderEditorNodePropertiesDefaults: EditorNodePropertiesDef<WhitegoodReminderEditorNodeProperties> =
  {
    ...BaseEditorNodePropertiesDefaults,
    matchers: {
      value: WhitegoodReminderNodeOptionsDefaults.matchers,
      required: true,
    },
    join: {
      value: WhitegoodReminderNodeOptionsDefaults.join,
      required: true,
    },
    discardNotMatched: {
      value: WhitegoodReminderNodeOptionsDefaults.discardNotMatched,
      required: true,
    },
    minMsgCount: {
      value: WhitegoodReminderNodeOptionsDefaults.minMsgCount,
      required: true,
    },
    offPowerLimit: {
      value: WhitegoodReminderNodeOptionsDefaults.offPowerLimit,
      required: true,
    },
    standbyPowerLimit: {
      value: WhitegoodReminderNodeOptionsDefaults.standbyPowerLimit,
      required: true,
    },
    cleanupEnabled: {
      value: WhitegoodReminderNodeOptionsDefaults.cleanupEnabled,
      required: true,
    },
    cleanupInterval: {
      value: WhitegoodReminderNodeOptionsDefaults.cleanupInterval,
      required: true,
    },
    emptyReminderEnabled: {
      value: WhitegoodReminderNodeOptionsDefaults.emptyReminderEnabled,
      required: true,
    },
    emptyReminderInterval: {
      value: WhitegoodReminderNodeOptionsDefaults.emptyReminderInterval,
      required: true,
    },
    emptyReminderUnit: {
      value: WhitegoodReminderNodeOptionsDefaults.emptyReminderUnit,
      required: true,
    },
    statusShowRuns: {
      value: WhitegoodReminderNodeOptionsDefaults.statusShowRuns,
      required: true,
    },
    outputs: {
      value: WhitegoodReminderNodeOptionsDefaults.outputs,
      required: true,
    },
  };
