import {
  defaultMatcherRow,
  MatchJoinNodeConfig,
  MatchJoinNodeEditorProperties,
} from "../../flowctrl/match-join/types";
import { NodeColor, NodeType } from "../../types";
import { helperCategory } from "../types";

export interface WindowReminderNodeConfig extends MatchJoinNodeConfig {
  interval: number;
}

export const defaultWindowReminderNodeConfig: Partial<WindowReminderNodeConfig> =
  {
    matchers: [
      { ...defaultMatcherRow, target: "window", targetType: "str" },
      {
        ...defaultMatcherRow,
        target: "presence",
        targetType: "str",
      },
    ],
    join: true,
    minMsgCount: 2,
    discardNotMatched: true,
    interval: 0,
  };

export interface WindowReminderNodeEditorProperties
  extends MatchJoinNodeEditorProperties {
  interval: number;
}

export const WindowReminderNodeType = new NodeType(
  helperCategory,
  "window-reminder",
  NodeColor.Climate
);
