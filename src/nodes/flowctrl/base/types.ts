import { EditorNodeProperties, NodeDef } from "node-red";

export interface BaseNodeConfig extends NodeDef {
  topic: string;
  topicType: string;
  debounce: boolean;
  debounceTime: number;
  debounceUnit: string;
  debounceLeading: boolean;
  debounceTrailing: boolean;
  filterUniquePayload: boolean;
  newMsg: boolean;
}

export const defaultBaseNodeConfig: Partial<BaseNodeConfig> = {
  topic: "topic",
  topicType: "msg",
  debounce: false,
  debounceTime: 100,
  debounceUnit: "ms",
  debounceLeading: false,
  debounceTrailing: true,
  filterUniquePayload: false,
  newMsg: false,
};

export interface BaseNodeEditorProperties extends EditorNodeProperties {
  topic: string;
  topicType: string;
  debounce: boolean;
  debounceTime: number;
  debounceUnit: string;
  debounceLeading: boolean;
  debounceTrailing: boolean;
  filterUniquePayload: boolean;
  newMsg: boolean;
}

export interface NodeSendOptions {
  send?: any;
  payload?: any;
  output?: number;
  additionalAttributes?: Record<string, any>;
}

export interface NodeStatusOutputConfig {
  output: number;
  topic: string;
}

export interface BaseNodeOptions {
  outputs?: number;
  statusOutput?: NodeStatusOutputConfig;
}
