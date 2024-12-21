import {
  defaultMatcherRow,
  MatchJoinNodeConfig,
  MatchJoinNodeEditorProperties,
} from "../../flowctrl/match-join/types";
import { NodeColor, NodeType } from "../../types";
import { helperCategory } from "../types";

export interface EventMapperRule {
  event: string;
  mapped: string;
  mappedType: string;
  output?: number;
}

export const defaultEventMapperRule: EventMapperRule = {
  event: "",
  mapped: "",
  mappedType: "str",
};

export interface EventMapperNodeConfig extends MatchJoinNodeConfig {
  rules: EventMapperRule[];
  ignoreUnknownEvents: boolean;
}

export const defaultEventMapperNodeConfig: Partial<EventMapperNodeConfig> = {
  matchers: [{ ...defaultMatcherRow, target: "event", targetType: "str" }],
  join: true,
  minMsgCount: 1,
  discardNotMatched: true,
  outputs: 1,
  rules: [defaultEventMapperRule],
  ignoreUnknownEvents: false,
};

export interface EventMapperNodeEditorProperties
  extends MatchJoinNodeEditorProperties {
  rules: EventMapperRule[];
  ignoreUnknownEvents: boolean;
}

export const EventMapperNodeType = new NodeType(
  helperCategory,
  "event-mapper",
  NodeColor.Switch
);

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
