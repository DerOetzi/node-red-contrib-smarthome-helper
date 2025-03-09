import { formatDate } from "@helpers/date.helper";
import { cloneDeep, isEqual } from "@helpers/object.helper";
import { convertToMilliseconds } from "@helpers/time.helper";
import { NodeCategory, NodeDoneFunction, NodeSendFunction } from "@nodes/types";
import {
  Node,
  NodeAPI,
  NodeMessage,
  NodeMessageInFlow,
  NodeStatusFill,
} from "node-red";
import {
  BaseCategory,
  BaseNodeDebounceData,
  BaseNodeDebounceRunning,
  BaseNodeDef,
  BaseNodeOptions,
  BaseNodeOptionsDefaults,
  BaseNodeStatus,
  NodeSendOptions,
  NodeStatus,
  NodeStatusOutputConfig,
} from "./types";

export default class BaseNode<
  T extends BaseNodeDef = BaseNodeDef,
  U extends BaseNodeOptions = BaseNodeOptions,
> {
  protected static readonly _nodeCategory: NodeCategory = BaseCategory;
  protected static readonly _nodeType: string = "base";

  public static get NodeTypeName(): string {
    return `${this._nodeCategory.name}-${this._nodeType}`;
  }

  public static get NodeCategory(): NodeCategory {
    return this._nodeCategory;
  }

  public static get NodeCategoryLabel(): string {
    return this._nodeCategory.label;
  }

  public static get NodeColor(): string {
    return this._nodeCategory.color;
  }

  protected readonly config: T;

  private _nodeStatus: NodeStatus;

  private debouncing: Record<string, BaseNodeDebounceRunning>;

  private lastSentPayloads: Record<string, any> = {};

  private statusOutput?: NodeStatusOutputConfig;

  constructor(
    protected readonly RED: NodeAPI,
    protected readonly node: Node,
    config: T,
    defaultConfig: U = BaseNodeOptionsDefaults as U
  ) {
    this.config = {
      ...defaultConfig,
      ...config,
    };

    this._nodeStatus = null;
    this.debouncing = {};
  }

  public registerListeners() {
    this.node.on("input", this.onInput.bind(this));
    this.node.on("close", this.onClose.bind(this));
  }

  protected registerStatusOutput(options: NodeStatusOutputConfig) {
    this.statusOutput = options;
  }

  protected onClose() {
    this.cleanup();
  }

  public cleanup() {
    this.resetFilter();
    this.resetDebounce();
  }

  protected resetFilter(): void {
    this.lastSentPayloads = {};
  }

  protected resetDebounce(): void {
    for (const key in this.debouncing) {
      if (this.debouncing[key].timer) {
        clearTimeout(this.debouncing[key].timer);
        this.debouncing[key].timer = null;
      }
    }

    this.debouncing = {};
  }

  protected onInput(
    msg: NodeMessageInFlow,
    send: NodeSendFunction,
    done: NodeDoneFunction
  ) {
    this.debounce({ msg: msg, send });

    if (done) {
      done();
    }
  }

  protected debounce(data: BaseNodeDebounceData): void {
    if (this.config.debounce) {
      const key = this.debounceKey(data.msg);

      const lastData: BaseNodeDebounceData = {
        ...data,
        msg: this.cloneMessage(data.msg),
      };

      if (this.debouncing[key]) {
        this.debouncing[key].lastData = lastData;
      } else {
        this.debouncing[key] = {
          timer: null,
          lastData,
        };
      }

      if (!this.debouncing[key].timer) {
        if (this.config.debounceLeading) {
          data.additionalAttributes = {
            ...data.additionalAttributes,
            debounced: "leading",
          };
          this.debounceListener(data);
        }

        if (this.config.debounceShowStatus) {
          this.setNodeStatus("Debounce", "blue", "Debounce");
        }

        this.debouncing[key].timer = setTimeout(
          () => {
            if (this.debouncing[key].timer) {
              clearTimeout(this.debouncing[key].timer);
              this.debouncing[key].timer = null;
            }

            if (this.config.debounceShowStatus) {
              this.setNodeStatus(this.nodeStatus);
            }

            if (this.config.debounceTrailing) {
              const lastData = this.debouncing[key].lastData;
              lastData.send = this.node.send.bind(this.node);
              lastData.msg = this.cloneMessage(lastData.msg);
              lastData.additionalAttributes = {
                ...data.additionalAttributes,
                debounced: "trailing",
              };

              this.debounceListener(lastData);
            }
          },
          convertToMilliseconds(
            this.config.debounceTime,
            this.config.debounceUnit
          )
        );
      }
    } else {
      this.debouncePass(data);
    }
  }

  protected debounceKey(msg: NodeMessage): string {
    return this.config.debounceTopic ? (msg.topic ?? "default") : "default";
  }

  protected isDebounceRunning(key: string): boolean {
    return Boolean(this.debouncing[key]?.timer);
  }

  protected cloneMessage(msg: NodeMessage): NodeMessage {
    const clonedMsg = cloneDeep<NodeMessage>(msg);
    delete clonedMsg._msgid;
    return clonedMsg;
  }

  protected debouncePass(data: BaseNodeDebounceData) {
    data.additionalAttributes = {
      ...data.additionalAttributes,
      debounced: "passed",
    };
    this.debounceListener(data);
  }

  protected debounceListener(data: BaseNodeDebounceData) {
    this.sendMsg(data.msg, data);
    this.updateStatusAfterDebounce(data);
  }

  protected sendMsg(msg: NodeMessage, options: NodeSendOptions = {}) {
    const topicValue = this.RED.util.evaluateNodeProperty(
      this.config.topic,
      this.config.topicType,
      this.node,
      msg
    );
    const payload = options.payload ?? msg.payload;

    if (this.config.newMsg ?? false) {
      msg = { payload: payload, topic: topicValue };
    } else {
      msg.payload = payload;
      msg.topic = topicValue;
    }

    if (this.config.filterUniquePayload ?? false) {
      const compareKey = this.config.filterkey ?? msg.topic ?? "default";

      if (this.filterPayload(this.lastSentPayloads, msg, compareKey)) {
        this.sendMsgToOutput(msg, options);
        this.lastSentPayloads[compareKey] =
          typeof msg.payload === "object" && msg.payload !== null
            ? cloneDeep<any>(msg.payload)
            : msg.payload;
      }
    } else {
      this.sendMsgToOutput(msg, options);
    }
  }

  private filterPayload(
    lastSentPayloads: Record<string, any>,
    msg: NodeMessage,
    compareKey: string
  ) {
    if (typeof msg.payload === "object" && msg.payload !== null) {
      return !isEqual(lastSentPayloads[compareKey], msg.payload);
    }

    return lastSentPayloads[compareKey] !== msg.payload;
  }

  protected updateStatusAfterDebounce(_: BaseNodeDebounceData) {
    this.nodeStatus = new Date();
  }

  protected get nodeStatus(): NodeStatus {
    return this._nodeStatus;
  }

  protected set nodeStatus(status: NodeStatus) {
    const currentStatus = this._nodeStatus;

    this.setNodeStatus(status);

    if (currentStatus !== status) {
      this._nodeStatus = status;
      if (this.statusOutput && (this.statusOutput.automatic ?? true)) {
        this.sendStatus(status);
      }
    }
  }

  public get statusReport(): BaseNodeStatus | null {
    if (this.config.statusReportingEnabled) {
      return {
        status: this.nodeStatus,
        statusItem: this.config.statusItem,
        statusText: this.statusTextFormatter(this.nodeStatus),
        statusTextItem: this.config.statusTextItem,
      };
    }

    return null;
  }

  protected setNodeStatus(
    status: NodeStatus,
    color?: NodeStatusFill,
    text?: string
  ) {
    this.node.status({
      fill: color ?? this.statusColor(status),
      shape: "dot",
      text: text ?? this.statusTextFormatter(status),
    });
  }

  protected statusColor(status: NodeStatus): NodeStatusFill {
    let color: NodeStatusFill = "red";
    if (status === null || status === "") {
      color = "grey";
    } else if (status) {
      color = "green";
    }

    return color;
  }

  protected statusTextFormatter(status: NodeStatus): string {
    let text = "";
    if (status === null || status === "") {
      text = "unknown";
    } else if (status instanceof Date) {
      text = formatDate(status);
    } else {
      text = status.toString();
    }

    return text;
  }

  protected sendStatus(status: NodeStatus) {
    if (this.statusOutput) {
      this.sendMsgToOutput(
        { payload: status, topic: this.statusOutput.topic },
        { output: this.statusOutput.output }
      );
    }
  }

  protected sendMsgToOutput(msg: NodeMessage, options: NodeSendOptions = {}) {
    if (options.additionalAttributes) {
      Object.assign(msg, options.additionalAttributes);
    }

    let msgs = Array(this.config.outputs ?? 1).fill(null);
    msgs[options.output ?? 0] = msg;

    const send: NodeSendFunction =
      options.send ?? this.node.send.bind(this.node);
    send(msgs);
  }
}
