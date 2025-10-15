import { TimeIntervalUnit } from "../../../../helpers/time.helper";
import { BaseNodeOptionsDefaults } from "../../../flowctrl/base/types";
import {
  MatcherRowDefaults,
  MatchJoinEditorNodeProperties,
  MatchJoinNodeDef,
  MatchJoinNodeOptions,
} from "../../../flowctrl/match-join/types";

export enum MoistureAlertTarget {
  moisture = "moisture",
  lastAlert = "lastAlert",
}

export interface MoistureAlertNodeOptions extends MatchJoinNodeOptions {
  alertThreshold: number;
  alertInterval: number;
  alertIntervalUnit: TimeIntervalUnit;
}

export const MoistureAlertNodeOptionsDefaults: MoistureAlertNodeOptions = {
  ...BaseNodeOptionsDefaults,
  matchers: [
    {
      ...MatcherRowDefaults,
      target: MoistureAlertTarget.moisture,
      targetType: "str",
    },
    {
      ...MatcherRowDefaults,
      target: MoistureAlertTarget.lastAlert,
      targetType: "str",
    },
  ],
  join: false,
  minMsgCount: 1,
  discardNotMatched: true,
  outputs: 2,
  alertThreshold: 40,
  alertInterval: 24,
  alertIntervalUnit: TimeIntervalUnit.h,
};

export interface MoistureAlertNodeDef
  extends MatchJoinNodeDef,
    MoistureAlertNodeOptions {}

export interface MoistureAlertEditorNodeProperties
  extends MatchJoinEditorNodeProperties,
    MoistureAlertNodeOptions {}
