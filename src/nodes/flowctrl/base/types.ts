import {
  EditorNodeProperties,
  EditorNodePropertiesDef,
  EditorWidgetTypedInputType,
  EditorWidgetTypedInputTypeDefinition,
  NodeDef,
  NodeMessage,
} from "node-red";
import { TimeIntervalUnit } from "../../../helpers/time.helper";
import version from "../../../version";
import { NodeCategory, NodeSendFunction } from "../../types";

interface BaseNodeCommonOptions {
  version: string;
  topic: string;
  topicType: string;
  filterUniquePayload: boolean;
  newMsg: boolean;
  outputs: number;
  inputs?: 0 | 1;
  filterkey?: string;

  //Deprecated since 0.27.0
  initializeDelay?: number;
  initializeDelayUnit?: TimeIntervalUnit;
}

const BaseNodeCommonOptionsDefaults: BaseNodeCommonOptions = {
  version: version,
  topic: "topic",
  topicType: "msg",
  filterUniquePayload: false,
  newMsg: false,
  outputs: 1,
  inputs: 1,
};

export interface BaseNodeStatusOptions {
  statusReportingEnabled: boolean;
  statusItem: string;
  statusTextItem: string;
}

const BaseNodeStatusOptionsDefaults: BaseNodeStatusOptions = {
  statusReportingEnabled: false,
  statusItem: "",
  statusTextItem: "",
};

interface BaseNodeDebounceOptions {
  debounce: boolean;
  debounceTopic: boolean;
  debounceShowStatus: boolean;
  debounceTime: number;
  debounceUnit: TimeIntervalUnit;
  debounceLeading: boolean;
  debounceTrailing: boolean;
}

const BaseNodeDebounceOptionsDefaults: BaseNodeDebounceOptions = {
  debounce: false,
  debounceTopic: false,
  debounceShowStatus: false,
  debounceTime: 100,
  debounceUnit: TimeIntervalUnit.ms,
  debounceLeading: false,
  debounceTrailing: true,
};

export interface BaseNodeOptions
  extends BaseNodeCommonOptions,
    BaseNodeStatusOptions,
    BaseNodeDebounceOptions {}

export const BaseNodeOptionsDefaults: BaseNodeOptions = {
  ...BaseNodeCommonOptionsDefaults,
  ...BaseNodeStatusOptionsDefaults,
  ...BaseNodeDebounceOptionsDefaults,
};

export interface BaseNodeDef extends NodeDef, BaseNodeOptions {
  g?: string;
}

export interface BaseEditorNodeProperties
  extends EditorNodeProperties,
    BaseNodeOptions {
  migrated: boolean;
}

export const BaseEditorNodePropertiesDefaults: EditorNodePropertiesDef<BaseEditorNodeProperties> =
  {
    name: { value: "", required: false },
    version: { value: BaseNodeOptionsDefaults.version, required: true },
    migrated: { value: false, required: true },
    topic: { value: BaseNodeOptionsDefaults.topic, required: true },
    topicType: {
      value: BaseNodeOptionsDefaults.topicType,
      required: true,
    },
    initializeDelay: {
      value: "",
      required: false,
    },
    initializeDelayUnit: {
      value: "",
      required: false,
    },
    statusReportingEnabled: {
      value: BaseNodeStatusOptionsDefaults.statusReportingEnabled,
      required: false,
    },
    statusItem: {
      value: BaseNodeStatusOptionsDefaults.statusItem,
      required: false,
    },
    statusTextItem: {
      value: BaseNodeStatusOptionsDefaults.statusTextItem,
      required: false,
    },
    debounce: {
      value: BaseNodeOptionsDefaults.debounce,
      required: false,
    },
    debounceTopic: {
      value: BaseNodeOptionsDefaults.debounceTopic,
      required: false,
    },
    debounceTime: {
      value: BaseNodeOptionsDefaults.debounceTime,
      required: false,
    },
    debounceShowStatus: {
      value: BaseNodeOptionsDefaults.debounceShowStatus,
      required: false,
    },
    debounceUnit: {
      value: BaseNodeOptionsDefaults.debounceUnit,
      required: false,
    },
    debounceLeading: {
      value: BaseNodeOptionsDefaults.debounceLeading,
      required: false,
    },
    debounceTrailing: {
      value: BaseNodeOptionsDefaults.debounceTrailing,
      required: false,
    },
    filterUniquePayload: {
      value: BaseNodeOptionsDefaults.filterUniquePayload,
      required: false,
    },
    newMsg: { value: BaseNodeOptionsDefaults.newMsg, required: false },
    outputs: { value: BaseNodeOptionsDefaults.outputs, required: true },
    inputs: { value: BaseNodeOptionsDefaults.inputs!, required: true },
  };

export interface NodeSendOptions {
  send?: NodeSendFunction;
  payload?: any;
  output?: number;
  additionalAttributes?: Record<string, any>;
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
  createUniqueIds?: boolean;
  defaultTypeInputWidth?: number;
}

export interface NodeEditorFormBuilderInputParams {
  id: string;
  label: string;
  icon: string;
  value?: string | number | boolean;
  translatePrefix?: string;
  translateLabelPrefix?: string;
}

export interface NodeEditorFormBuilderNumberInputParams
  extends NodeEditorFormBuilderInputParams {
  min?: number;
  max?: number;
  step?: number;
}

export interface NodeEditorFormBuilderTypedInputParams
  extends NodeEditorFormBuilderInputParams {
  idType: string;
  valueType: string;
  types?: (EditorWidgetTypedInputType | EditorWidgetTypedInputTypeDefinition)[];
  width?: number;
}

export interface NodeEditorFormBuilderAutocompleteMatch {
  value: string;
  label: string;
  i: number;
}

export interface NodeEditorFormBuilderAutocompleteInputParams
  extends NodeEditorFormBuilderInputParams {
  search: (term: string) => Promise<NodeEditorFormBuilderAutocompleteMatch[]>;
}

export interface NodeEditorFormBuilderTimeInputParams
  extends NodeEditorFormBuilderInputParams {
  idType: string;
  valueType?: TimeIntervalUnit;
}

export interface NodeEditorFormBuilderSelectOption {
  value: string;
  label: string;
}

export interface NodeEditorFormBuilderSelectParams
  extends NodeEditorFormBuilderInputParams {
  options: (string | NodeEditorFormBuilderSelectOption)[];
}

export interface NodeEditorFormBuilderHiddenInputParams {
  id: string;
  value: string | number | boolean;
}

export const BaseCategory: NodeCategory = {
  label: "Smarthome Flow Control",
  name: "flowctrl",
  color: "#7fffd4",
};

export interface BaseNodeStatus {
  status: NodeStatus;
  statusItem: string;
  statusText: string;
  statusTextItem: string;
}
