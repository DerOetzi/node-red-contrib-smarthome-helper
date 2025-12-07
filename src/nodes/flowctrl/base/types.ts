import {
  EditorNodeProperties,
  EditorWidgetTypedInputType,
  EditorWidgetTypedInputTypeDefinition,
  NodeDef,
  NodeMessage,
} from "node-red";
import { cloneDeep } from "../../../helpers/object.helper";
import { TimeIntervalUnit } from "../../../helpers/time.helper";
import version from "../../../version";
import { NodeCategory, NodeSendFunction } from "../../types";

interface BaseNodeCommonOptions {
  name: string;
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
  name: "",
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
  name: string;
  migrated: boolean;
}

export class NodeMessageFlow {
  private readonly _originalMessage: NodeMessage;

  private _topic?: string;
  private _payload?: any;

  protected additionalAttributes: Record<string, any> = {};

  constructor(
    msg: NodeMessage,
    public output: number,
    public send?: NodeSendFunction,
    topic?: string,
    payload?: any
  ) {
    this.topic = topic ?? msg.topic;
    this.payload = payload ?? msg.payload;
    this._originalMessage = cloneDeep<NodeMessage>(msg);
  }

  public get topic(): string | undefined {
    return this._topic;
  }

  public set topic(topic: string | undefined) {
    this._topic = topic;
  }

  public get payload(): any {
    return cloneDeep<any>(this._payload);
  }

  public set payload(payload: any) {
    this._payload = cloneDeep<any>(payload);
  }

  public getPayload<T>(): T | undefined {
    return this._payload as T;
  }

  public payloadAsNumber(defaultValue?: number): number | undefined {
    if (this._payload === undefined || this._payload === null) {
      return defaultValue;
    }

    const value = Number(this._payload);
    return Number.isNaN(value) ? defaultValue : value;
  }

  public payloadAsBoolean(defaultValue: boolean): boolean {
    if (this._payload === undefined || this._payload === null) {
      return defaultValue;
    }

    if (typeof this._payload === "boolean") {
      return this._payload;
    }

    if (typeof this._payload === "number") {
      return this._payload !== 0;
    }

    if (typeof this._payload === "string") {
      const lower = this._payload.toLowerCase().trim();

      if (lower === "true" || lower === "1" || lower === "on") {
        return true;
      }

      if (lower === "false" || lower === "0" || lower === "off") {
        return false;
      }
    }

    return defaultValue;
  }

  public get originalMsg(): NodeMessage {
    return cloneDeep<NodeMessage>(this._originalMessage);
  }

  public get originalTopic(): string | undefined {
    return this._originalMessage.topic;
  }

  public get originalPayload(): any {
    return cloneDeep<any>(this._originalMessage.payload);
  }

  public updateAdditionalAttribute(key: string, value: any): void {
    this.additionalAttributes[key] = value;
  }

  public getAdditionalAttribute(key: string): any {
    return key in this.additionalAttributes
      ? this.additionalAttributes[key]
      : undefined;
  }

  public clone() {
    const messageFlow = new NodeMessageFlow(
      this.originalMsg,
      this.output,
      this.send
    );
    messageFlow.topic = this.topic;
    messageFlow.payload = this.payload;
    messageFlow.additionalAttributes = cloneDeep(this.additionalAttributes);
    return messageFlow;
  }

  public newMessage(): NodeMessage {
    return { topic: this.topic, payload: this.payload } as NodeMessage;
  }

  public message(): NodeMessage {
    const msg = this.originalMsg;
    msg.topic = this.topic;
    msg.payload = this.payload;

    return msg;
  }

  public addAttributes(msg: NodeMessage): NodeMessage {
    Object.assign(msg, this.additionalAttributes);
    return msg;
  }
}

export type NodeStatus = string | number | boolean | Date | null;

export interface BaseNodeDebounceRunning {
  timer: NodeJS.Timeout | null;
  lastData: NodeMessageFlow;
}

export interface NodeEditorFormBuilderParams {
  translatePrefix: string;
  createUniqueIds?: boolean;
  defaultTypeInputWidth?: number;
}

export interface NodeEditorFormBuilderInputParams {
  id: string;
  label: string;
  labelPlaceholders?: Record<string, string>;
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
