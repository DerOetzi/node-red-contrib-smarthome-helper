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

export const WindowReminderEditorNodePropertiesDefaults: EditorNodePropertiesDef<WindowReminderEditorNodeProperties> =
  {
    ...BaseEditorNodePropertiesDefaults,
    matchers: {
      value: WindowReminderNodeOptionsDefaults.matchers,
      required: true,
    },
    join: {
      value: WindowReminderNodeOptionsDefaults.join,
      required: true,
    },
    discardNotMatched: {
      value: WindowReminderNodeOptionsDefaults.discardNotMatched,
      required: true,
    },
    minMsgCount: {
      value: WindowReminderNodeOptionsDefaults.minMsgCount,
      required: true,
    },
    intervals: {
      value: WindowReminderNodeOptionsDefaults.intervals,
      required: true,
    },
    interval: {
      value: "",
      required: false,
    },
    intervalUnit: {
      value: "",
      required: false,
    },
    interval2: {
      value: "",
      required: false,
    },
    intervalUnit2: {
      value: "",
      required: false,
    },
  };
