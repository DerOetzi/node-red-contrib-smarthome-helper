import {
  BaseEditorNodeProperties,
  BaseNodeDef,
  BaseNodeOptionsDefaults,
} from "../base/types";
import { MatcherRowDefaults, MatchJoinNodeOptions } from "../match-join/types";

export enum StatusNodeTarget {
  activeCondition = "activeCondition",
}

export enum StatusNodeScope {
  global = "global",
  flow = "flow",
  group = "group",
}

export interface StatusNodeOptions extends MatchJoinNodeOptions {
  scope: StatusNodeScope;
  initialActive: boolean;
}

export const StatusNodeOptionsDefaults: StatusNodeOptions = {
  ...BaseNodeOptionsDefaults,
  matchers: [
    {
      ...MatcherRowDefaults,
      target: StatusNodeTarget.activeCondition,
      targetType: "str",
    },
  ],
  join: false,
  discardNotMatched: true,
  minMsgCount: 1,
  statusReportingEnabled: false,
  filterUniquePayload: true,
  scope: StatusNodeScope.flow,
  initialActive: false,
  outputs: 2,
};

export interface StatusNodeDef extends BaseNodeDef, StatusNodeOptions {}

export interface StatusEditorNodeProperties
  extends BaseEditorNodeProperties,
    StatusNodeOptions {}
