import {
  EditorNodeProperties,
  EditorNodePropertiesDef,
  EditorWidgetTypedInputType,
  EditorWidgetTypedInputTypeDefinition,
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
  inputs?: 0 | 1;
  initializeDelay?: number;
  initializeDelayUnit?: string;
  filterkey?: string;
}

const BaseNodeCommonOptionsDefaults: Partial<BaseNodeCommonOptions> = {
  topic: "topic",
  topicType: "msg",
  filterUniquePayload: false,
  newMsg: false,
  outputs: 1,
  inputs: 1,
  initializeDelay: 100,
  initializeDelayUnit: "ms",
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
  extends BaseNodeCommonOptions,
    BaseNodeDebounceOptions {}

export interface BaseNodeDef extends NodeDef, BaseNodeOptions {}

export const BaseNodeOptionsDefaults: Partial<BaseNodeDef> = {
  name: "",
  ...BaseNodeCommonOptionsDefaults,
  ...BaseNodeDebounceOptionsDefaults,
};

export interface BaseEditorNodeProperties
  extends EditorNodeProperties,
    BaseNodeOptions {}

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
    inputs: { value: BaseNodeCommonOptionsDefaults.inputs!, required: true },
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

export interface NodeEditorFormBuilderParams {
  translatePrefix: string;
  translate: (key: string) => string;
  createUniqueIds?: boolean;
  defaultTypeInputWidth?: number;
}

export interface NodeEditorFormBuilderInputParams {
  id: string;
  label: string;
  icon: string;
  value: string | number | boolean;
}

export interface NodeEditorFormBuilderTypedInputParams
  extends NodeEditorFormBuilderInputParams {
  idType: string;
  valueType: string;
  types?: (EditorWidgetTypedInputType | EditorWidgetTypedInputTypeDefinition)[];
  width?: number;
}

export interface NodeEditorFormBuilderTimeInputParams
  extends NodeEditorFormBuilderInputParams {
  idType: string;
  valueType?: string;
}

export interface NodeEditorFormBuilderSelectParams
  extends NodeEditorFormBuilderInputParams {
  options: string[] | { value: string; label: string }[];
}
