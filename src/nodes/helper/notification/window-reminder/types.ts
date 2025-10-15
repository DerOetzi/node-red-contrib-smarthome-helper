import { TimeIntervalUnit } from "../../../../helpers/time.helper";
import { BaseNodeOptionsDefaults } from "../../../flowctrl/base/types";
import {
  MatcherRowDefaults,
  MatchJoinEditorNodeProperties,
  MatchJoinNodeDef,
  MatchJoinNodeOptions,
} from "../../../flowctrl/match-join/types";

export enum WindowReminderTarget {
  window = "window",
  presence = "presence",
  command = "command",
  intervalSelect = "intervalSelect",
}

export interface WindowReminderIntervalRow {
  interval: number;
  intervalUnit: TimeIntervalUnit;
}

export const WindowReminderIntervalRowDefaults: WindowReminderIntervalRow = {
  interval: 10,
  intervalUnit: TimeIntervalUnit.m,
};

export interface WindowReminderNodeOptions extends MatchJoinNodeOptions {
  intervals: WindowReminderIntervalRow[];

  //deprecated from 0.37.0
  interval?: number;
  intervalUnit?: TimeIntervalUnit;
  interval2?: number;
  intervalUnit2?: TimeIntervalUnit;
}

export const WindowReminderNodeOptionsDefaults: WindowReminderNodeOptions = {
  ...BaseNodeOptionsDefaults,
  matchers: [
    {
      ...MatcherRowDefaults,
      target: WindowReminderTarget.window,
      targetType: "str",
    },
    {
      ...MatcherRowDefaults,
      target: WindowReminderTarget.presence,
      targetType: "str",
    },
  ],
  join: false,
  minMsgCount: 1,
  discardNotMatched: true,
  intervals: [],
};

export interface WindowReminderNodeDef
  extends MatchJoinNodeDef,
    WindowReminderNodeOptions {}

export interface WindowReminderEditorNodeProperties
  extends MatchJoinEditorNodeProperties,
    WindowReminderNodeOptions {}
