import { EditorNodePropertiesDef } from "node-red";
import {
  ApplicableCompareFunction,
  NotApplicableCompareFunction,
} from "../../logical/compare/types";
import {
  BaseEditorNodeProperties,
  BaseEditorNodePropertiesDefaults,
  BaseNodeDef,
  BaseNodeOptions,
  BaseNodeOptionsDefaults,
} from "../base/types";

export interface MatchFixedTargets {
  targets: string[];
  translatePrefix: string;
}

export interface MatcherRow {
  property: string;
  propertyType: string;
  operation: ApplicableCompareFunction | NotApplicableCompareFunction;
  compare: string;
  compareType: string;
  target: string;
  targetType: string;

  // deprecated since 0.21.1
  operator?: string;
}

export const MatcherRowDefaults: MatcherRow = {
  property: "topic",
  propertyType: "msg",
  operation: ApplicableCompareFunction.eq,
  compare: "",
  compareType: "str",
  target: "topic",
  targetType: "msg",
};

export interface MatchJoinNodeOptions extends BaseNodeOptions {
  matchers: MatcherRow[];
  discardNotMatched: boolean;
  join: boolean;
  minMsgCount: number;
}

export const MatchJoinNodeOptionsDefaults: MatchJoinNodeOptions = {
  ...BaseNodeOptionsDefaults,
  filterkey: "filterMessages",
  matchers: [MatcherRowDefaults],
  discardNotMatched: true,
  join: false,
  minMsgCount: 1,
};

export interface MatchJoinNodeDef extends BaseNodeDef, MatchJoinNodeOptions {}

export interface MatchJoinEditorNodeProperties
  extends BaseEditorNodeProperties,
    MatchJoinNodeOptions {}

export const MatchJoinEditorNodePropertiesDefaults: EditorNodePropertiesDef<MatchJoinEditorNodeProperties> =
  {
    ...BaseEditorNodePropertiesDefaults,
    matchers: {
      value: MatchJoinNodeOptionsDefaults.matchers,
      required: true,
    },
    discardNotMatched: {
      value: MatchJoinNodeOptionsDefaults.discardNotMatched,
      required: true,
    },
    join: {
      value: MatchJoinNodeOptionsDefaults.join,
      required: true,
    },
    minMsgCount: {
      value: MatchJoinNodeOptionsDefaults.minMsgCount,
      required: true,
    },
  };
