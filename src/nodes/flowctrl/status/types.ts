import {
  ActiveControllerNodeOptions,
  ActiveControllerNodeOptionsDefaults,
  ActiveControllerTarget,
} from "../active-controller/types";
import { BaseEditorNodeProperties, BaseNodeDef } from "../base/types";
import { MatcherRowDefaults } from "../match-join/types";

export enum StatusNodeScope {
  global = "global",
  flow = "flow",
  group = "group",
}

export interface StatusNodeOptions extends ActiveControllerNodeOptions {
  scope: StatusNodeScope;

  //deprecated 1.1.0
  initialActive?: boolean;
}

export const StatusNodeOptionsDefaults: StatusNodeOptions = {
  ...ActiveControllerNodeOptionsDefaults,
  matchers: [
    {
      ...MatcherRowDefaults,
      target: ActiveControllerTarget.activeCondition,
      targetType: "str",
    },
  ],
  join: false,
  discardNotMatched: true,
  minMsgCount: 1,
  statusReportingEnabled: false,
  filterUniquePayload: true,
  scope: StatusNodeScope.flow,
  outputs: 2,
};

export interface StatusNodeDef extends BaseNodeDef, StatusNodeOptions {}

export interface StatusEditorNodeProperties
  extends BaseEditorNodeProperties, StatusNodeOptions {}
