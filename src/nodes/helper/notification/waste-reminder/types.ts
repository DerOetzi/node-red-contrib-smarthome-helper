import {
  InputNodeOptionsDefaults,
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
  ...InputNodeOptionsDefaults,
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
};

export interface WasteReminderNodeDef
  extends MatchJoinNodeDef, WasteReminderNodeOptions {}

export interface WasteReminderEditorNodeProperties
  extends MatchJoinEditorNodeProperties, WasteReminderNodeOptions {}
