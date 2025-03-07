import {
  BaseEditorNodePropertiesDefaults,
  BaseNodeOptionsDefaults,
} from "@base/types";
import {
  MatcherRowDefaults,
  MatchJoinEditorNodeProperties,
  MatchJoinNodeDef,
  MatchJoinNodeOptions,
} from "@match-join/types";
import { EditorNodePropertiesDef } from "node-red";

export enum WhitegoodReminderTarget {
  power = "power",
  runs = "runs",
}

export enum WhitegoodStatus {
  off = "off",
  standby = "standby",
  running = "running",
}

export interface WhitegoodReminderNodeOptions extends MatchJoinNodeOptions {
  offPowerLimit: number;
  standbyPowerLimit: number;
  cleanupEnabled: boolean;
  cleanupInterval: number;
  statusShowRuns: boolean;
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
    statusShowRuns: {
      value: WhitegoodReminderNodeOptionsDefaults.statusShowRuns,
      required: true,
    },
    outputs: {
      value: WhitegoodReminderNodeOptionsDefaults.outputs,
      required: true,
    },
  };
