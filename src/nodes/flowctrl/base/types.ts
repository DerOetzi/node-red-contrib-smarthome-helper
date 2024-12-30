import {
  EditorNodeProperties,
  EditorNodePropertiesDef,
  NodeDef,
  NodeMessage,
} from "node-red";
import { NodeSendFunction } from "../../types";

interface BaseNodeCommonOptions {
  topic: string;
  topicType: string;
  filterUniquePayload: boolean;
  newMsg: boolean;
  outputs: number;
  initializeDelay?: number;
  filterkey?: string;
}

const BaseNodeCommonOptionsDefaults: Partial<BaseNodeCommonOptions> = {
  topic: "topic",
  topicType: "msg",
  filterUniquePayload: false,
  newMsg: false,
  outputs: 1,
  initializeDelay: 100,
};

interface BaseNodeDebounceOptions {
  debounce: boolean;
  debounceTopic: boolean;
  debounceShowStatus: boolean;
  debounceTime: number;
  debounceUnit: string;
  debounceLeading: boolean;
  debounceTrailing: boolean;
}

const BaseNodeDebounceOptionsDefaults: Partial<BaseNodeDebounceOptions> = {
  debounce: false,
  debounceTopic: false,
  debounceShowStatus: false,
  debounceTime: 100,
  debounceUnit: "ms",
  debounceLeading: false,
  debounceTrailing: true,
};

export interface BaseNodeOptions
  extends NodeDef,
    BaseNodeDebounceOptions,
    BaseNodeCommonOptions {}

export const BaseNodeOptionsDefaults: Partial<BaseNodeOptions> = {
  name: "",
  ...BaseNodeCommonOptionsDefaults,
  ...BaseNodeDebounceOptionsDefaults,
};

export interface BaseEditorNodeProperties
  extends EditorNodeProperties,
    BaseNodeDebounceOptions,
    BaseNodeCommonOptions {}

export const BaseEditorNodePropertiesDefaults: EditorNodePropertiesDef<BaseEditorNodeProperties> =
  {
    name: { value: "", required: false },
    topic: { value: BaseNodeCommonOptionsDefaults.topic!, required: true },
    topicType: {
      value: BaseNodeCommonOptionsDefaults.topicType!,
      required: true,
    },
    debounce: {
      value: BaseNodeDebounceOptionsDefaults.debounce!,
      required: false,
    },
    debounceTopic: {
      value: BaseNodeDebounceOptionsDefaults.debounceTopic!,
      required: false,
    },
    debounceTime: {
      value: BaseNodeDebounceOptionsDefaults.debounceTime!,
      required: false,
    },
    debounceShowStatus: {
      value: BaseNodeDebounceOptionsDefaults.debounceShowStatus!,
      required: false,
    },
    debounceUnit: {
      value: BaseNodeDebounceOptionsDefaults.debounceUnit!,
      required: false,
    },
    debounceLeading: {
      value: BaseNodeDebounceOptionsDefaults.debounceLeading!,
      required: false,
    },
    debounceTrailing: {
      value: BaseNodeDebounceOptionsDefaults.debounceTrailing!,
      required: false,
    },
    filterUniquePayload: {
      value: BaseNodeCommonOptionsDefaults.filterUniquePayload!,
      required: false,
    },
    newMsg: { value: BaseNodeCommonOptionsDefaults.newMsg!, required: false },
    outputs: { value: BaseNodeCommonOptionsDefaults.outputs!, required: true },
  };

export interface NodeSendOptions {
  send?: NodeSendFunction;
  payload?: any;
  output?: number;
  additionalAttributes?: Record<string, any>;
}

export interface NodeStatusOutputConfig {
  automatic?: boolean;
  output: number;
  topic: string;
}

export type NodeStatus = string | number | boolean | Date | null;

export interface BaseNodeDebounceData extends NodeSendOptions {
  msg: NodeMessage;
}

export interface BaseNodeDebounceRunning {
  timer: NodeJS.Timeout | null;
  lastData: BaseNodeDebounceData;
}
