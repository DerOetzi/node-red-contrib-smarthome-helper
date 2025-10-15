import { BaseNodeOptionsDefaults } from "../../../flowctrl/base/types";
import {
  MatcherRowDefaults,
  MatchJoinEditorNodeProperties,
  MatchJoinNodeDef,
  MatchJoinNodeOptions,
} from "../../../flowctrl/match-join/types";

export enum EventMapperTarget {
  event = "event",
}

export interface EventMapperRule {
  event: string;
  mapped: string;
  mappedType: string;
  output?: number;
}

export const EventMapperRuleDefaults: EventMapperRule = {
  event: "",
  mapped: "",
  mappedType: "str",
};

export interface EventMapperNodeOptions extends MatchJoinNodeOptions {
  rules: EventMapperRule[];
  ignoreUnknownEvents: boolean;
}

export const EventMapperNodeOptionsDefaults: EventMapperNodeOptions = {
  ...BaseNodeOptionsDefaults,
  matchers: [{ ...MatcherRowDefaults, target: "event", targetType: "str" }],
  join: false,
  minMsgCount: 1,
  discardNotMatched: true,
  outputs: 1,
  rules: [EventMapperRuleDefaults],
  ignoreUnknownEvents: false,
};

export interface EventMapperNodeDef
  extends MatchJoinNodeDef,
    EventMapperNodeOptions {}

export interface EventMapperEditorNodeProperties
  extends MatchJoinEditorNodeProperties,
    EventMapperNodeOptions {}

export const autocompleteEvents = [
  "toggle",
  "on",
  "off",
  "brightness_move_up",
  "brightness_move_down",
  "brightness_stop",
  "brightness_up_click",
  "brightness_down_click",
  "brightness_up_hold",
  "brightness_up_release",
  "brightness_down_hold",
  "brightness_down_release",
  "toggle_hold",
  "arrow_left_click",
  "arrow_left_hold",
  "arrow_left_release",
  "arrow_right_click",
  "arrow_right_hold",
  "arrow_right_release",
];
