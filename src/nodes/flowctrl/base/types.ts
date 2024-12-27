import { EditorNodeProperties, NodeDef } from "node-red";
import { NodeColor, NodeType } from "../../types";
import { flowctrlCategory } from "../types";

export interface BaseNodeConfig extends NodeDef {
  topic: string;
  topicType: string;
  debounce: boolean;
  debounceTopic: boolean;
  debounceShowStatus: boolean;
  debounceTime: number;
  debounceUnit: string;
  debounceLeading: boolean;
  debounceTrailing: boolean;
  filterUniquePayload: boolean;
  newMsg: boolean;
  outputs: number;
}

export const defaultBaseNodeConfig: Partial<BaseNodeConfig> = {
  topic: "topic",
  topicType: "msg",
  debounce: false,
  debounceTopic: false,
  debounceShowStatus: false,
  debounceTime: 100,
  debounceUnit: "ms",
  debounceLeading: false,
  debounceTrailing: true,
  filterUniquePayload: false,
  newMsg: false,
  outputs: 1,
};

export interface BaseNodeEditorProperties extends EditorNodeProperties {
  topic: string;
  topicType: string;
  debounce: boolean;
  debounceTopic: boolean;
  debounceShowStatus: boolean;
  debounceTime: number;
  debounceUnit: string;
  debounceLeading: boolean;
  debounceTrailing: boolean;
  filterUniquePayload: boolean;
  newMsg: boolean;
  outputs: number;
}

export interface NodeSendOptions {
  send?: any;
  payload?: any;
  output?: number;
  additionalAttributes?: Record<string, any>;
}

export interface NodeStatusOutputConfig {
  automatic?: boolean;
  output: number;
  topic: string;
}

export interface BaseNodeOptions {
  statusOutput?: NodeStatusOutputConfig;
  initializeDelay?: number;
  filterkey?: string;
}

export const defaultBaseNodeOptions: BaseNodeOptions = {
  initializeDelay: 100,
};

export interface BaseNodeDebounceData extends NodeSendOptions {
  received_msg?: any;
}

export interface BaseNodeDebounceRunning {
  timer: NodeJS.Timeout | null;
  lastData: BaseNodeDebounceData;
}

export const BaseNodeType = new NodeType(
  flowctrlCategory,
  "base",
  NodeColor.Base
);
