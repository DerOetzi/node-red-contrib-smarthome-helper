import {
  BaseEditorNodePropertiesDefaults,
  BaseNodeOptionsDefaults,
} from "@base/types";
import { NotApplicableCompareFunction } from "@logical/compare/types";
import {
  MatcherRowDefaults,
  MatchJoinEditorNodeProperties,
  MatchJoinNodeDef,
  MatchJoinNodeOptions,
} from "@match-join/types";
import { EditorNodePropertiesDef } from "node-red";

export enum NotifyDispatcherTarget {
  message = "message",
  person1 = "person1",
  person2 = "person2",
  person3 = "person3",
  person4 = "person4",
  person5 = "person5",
  person6 = "person6",
  person7 = "person7",
  person8 = "person8",
  person9 = "person9",
  person10 = "person10",
}

export const NotifyDispatcherPersonMetadata: Record<
  NotifyDispatcherTarget,
  { output: number }
> = {
  [NotifyDispatcherTarget.message]: { output: 0 },
  [NotifyDispatcherTarget.person1]: { output: 1 },
  [NotifyDispatcherTarget.person2]: { output: 2 },
  [NotifyDispatcherTarget.person3]: { output: 3 },
  [NotifyDispatcherTarget.person4]: { output: 4 },
  [NotifyDispatcherTarget.person5]: { output: 5 },
  [NotifyDispatcherTarget.person6]: { output: 6 },
  [NotifyDispatcherTarget.person7]: { output: 7 },
  [NotifyDispatcherTarget.person8]: { output: 8 },
  [NotifyDispatcherTarget.person9]: { output: 9 },
  [NotifyDispatcherTarget.person10]: { output: 10 },
};

export interface NotifyDispatcherNodeOptions extends MatchJoinNodeOptions {
  persons: number;
}

export const NotifyDispatcherNodeOptionsDefaults: NotifyDispatcherNodeOptions =
  {
    ...BaseNodeOptionsDefaults,
    matchers: [
      {
        ...MatcherRowDefaults,
        property: "notify",
        propertyType: "msg",
        operation: NotApplicableCompareFunction.notEmpty,
        target: NotifyDispatcherTarget.message,
        targetType: "str",
      },
      {
        ...MatcherRowDefaults,
        target: NotifyDispatcherTarget.person1,
        targetType: "str",
      },
    ],
    join: false,
    discardNotMatched: true,
    minMsgCount: 2,
    outputs: 2,
    persons: 1,
  };

export interface NotifyDispatcherNodeDef
  extends MatchJoinNodeDef,
    NotifyDispatcherNodeOptions {}

export interface NotifyDispatcherEditorNodeProperties
  extends MatchJoinEditorNodeProperties,
    NotifyDispatcherNodeOptions {}

export const NotifyDispatcherEditorNodeDefaults: EditorNodePropertiesDef<NotifyDispatcherEditorNodeProperties> =
  {
    ...BaseEditorNodePropertiesDefaults,
    matchers: {
      value: NotifyDispatcherNodeOptionsDefaults.matchers,
      required: true,
    },
    join: {
      value: NotifyDispatcherNodeOptionsDefaults.join,
      required: true,
    },
    discardNotMatched: {
      value: NotifyDispatcherNodeOptionsDefaults.discardNotMatched,
      required: true,
    },
    minMsgCount: {
      value: NotifyDispatcherNodeOptionsDefaults.minMsgCount,
      required: true,
    },
    persons: {
      value: NotifyDispatcherNodeOptionsDefaults.persons,
      required: true,
    },
    outputs: {
      value: NotifyDispatcherNodeOptionsDefaults.outputs,
      required: true,
    },
  };
