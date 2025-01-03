import { EditorNodePropertiesDef, NodeMessage } from "node-red";
import {
  BaseEditorNodeProperties,
  BaseEditorNodePropertiesDefaults,
  BaseNodeDebounceData,
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
  operator: string;
  compare: string;
  compareType: string;
  target: string;
  targetType: string;
}

export const MatcherRowDefaults: MatcherRow = {
  property: "topic",
  propertyType: "msg",
  operator: "eq",
  compare: "",
  compareType: "str",
  target: "topic",
  targetType: "msg",
};

export interface MatchJoinNodeOptions extends BaseNodeOptions {
  join: boolean;
  discardNotMatched: boolean;
  matchers: MatcherRow[];
  minMsgCount: number;
}

export interface MatchJoinNodeDef extends BaseNodeDef, MatchJoinNodeOptions {}

export const MatchJoinNodeOptionsDefaults: Partial<MatchJoinNodeDef> = {
  ...BaseNodeOptionsDefaults,
  filterkey: "filterMessages",
  join: false,
  discardNotMatched: true,
  matchers: [MatcherRowDefaults],
  minMsgCount: 1,
};

export interface MatchJoinEditorNodeProperties
  extends BaseEditorNodeProperties,
    MatchJoinNodeOptions {}

export const MatchJoinEditorNodePropertiesDefaults: EditorNodePropertiesDef<MatchJoinEditorNodeProperties> =
  {
    ...BaseEditorNodePropertiesDefaults,
    join: {
      value: MatchJoinNodeOptionsDefaults.join!,
      required: true,
    },
    discardNotMatched: {
      value: MatchJoinNodeOptionsDefaults.discardNotMatched!,
      required: true,
    },
    matchers: {
      value: MatchJoinNodeOptionsDefaults.matchers!,
      required: true,
    },
    minMsgCount: {
      value: MatchJoinNodeOptionsDefaults.minMsgCount!,
      required: true,
    },
  };

export interface MatchJoinNodeData extends BaseNodeDebounceData {
  msg: MatchJoinNodeMessage;
  input: any;
}

export interface MatchJoinNodeMessage extends NodeMessage {
  originalTopic?: string;
}
