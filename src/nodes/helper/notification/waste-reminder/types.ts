import { EditorNodePropertiesDef } from "node-red";
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

export enum WasteReminderTarget {
  types = "types",
  remaining = "remaining",
}

export interface WasteReminderNodeOptions extends MatchJoinNodeOptions {}

export const WasteReminderNodeOptionsDefaults: WasteReminderNodeOptions = {
  ...BaseNodeOptionsDefaults,
  matchers: [
    {
      ...MatcherRowDefaults,
      target: WasteReminderTarget.types,
      targetType: "str",
    },
    {
      ...MatcherRowDefaults,
      target: WasteReminderTarget.remaining,
      targetType: "str",
    },
  ],
  join: false,
  minMsgCount: 1,
  discardNotMatched: true,
};

export interface WasteReminderNodeDef
  extends MatchJoinNodeDef,
    WasteReminderNodeOptions {}

export interface WasteReminderEditorNodeProperties
  extends MatchJoinEditorNodeProperties,
    WasteReminderNodeOptions {}

export const WasteReminderEditorNodePropertiesDefaults: EditorNodePropertiesDef<WasteReminderEditorNodeProperties> =
  {
    ...BaseEditorNodePropertiesDefaults,
    matchers: {
      value: WasteReminderNodeOptionsDefaults.matchers,
      required: true,
    },
    join: {
      value: WasteReminderNodeOptionsDefaults.join,
      required: true,
    },
    discardNotMatched: {
      value: WasteReminderNodeOptionsDefaults.discardNotMatched,
      required: true,
    },
    minMsgCount: {
      value: WasteReminderNodeOptionsDefaults.minMsgCount,
      required: true,
    },
  };
