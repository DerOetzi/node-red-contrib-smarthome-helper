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

export interface WindowReminderNodeOptions extends MatchJoinNodeOptions {
  interval: number;
  intervalUnit: TimeIntervalUnit;
  interval2: number;
  intervalUnit2: TimeIntervalUnit;
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
    {
      ...MatcherRowDefaults,
      target: WindowReminderTarget.command,
      targetType: "str",
    },
    {
      ...MatcherRowDefaults,
      target: WindowReminderTarget.intervalSelect,
      targetType: "str",
    },
  ],
  join: false,
  minMsgCount: 1,
  discardNotMatched: true,
  interval: 0,
  intervalUnit: TimeIntervalUnit.m,
  interval2: 0,
  intervalUnit2: TimeIntervalUnit.m,
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
    interval: {
      value: WindowReminderNodeOptionsDefaults.interval,
      required: true,
    },
    intervalUnit: {
      value: WindowReminderNodeOptionsDefaults.intervalUnit,
      required: true,
    },
    interval2: {
      value: WindowReminderNodeOptionsDefaults.interval2,
      required: true,
    },
    intervalUnit2: {
      value: WindowReminderNodeOptionsDefaults.intervalUnit2,
      required: true,
    },
  };
