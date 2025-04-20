import {
  Node,
  NodeAPI,
  NodeMessage,
  NodeMessageInFlow,
  NodeStatusFill,
} from "node-red";
import { formatDate } from "../../../helpers/date.helper";
import { cloneDeep, isEqual } from "../../../helpers/object.helper";
import { convertToMilliseconds } from "../../../helpers/time.helper";
import { NodeCategory, NodeDoneFunction, NodeSendFunction } from "../../types";
import StatusNode from "../status";
import { StatusNodesConnector } from "../status/connector";
import {
  BaseCategory,
  BaseNodeDebounceRunning,
  BaseNodeDef,
  BaseNodeOptions,
  BaseNodeOptionsDefaults,
  BaseNodeStatus,
  NodeMessageFlow,
  NodeStatus,
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

  private readonly statusListeners: Set<StatusNode> = new Set();

  private lastSentPayloads: Record<string, any> = {};

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

  public register(statusNodesConnector: StatusNodesConnector): void {
    this.node.on("input", this.onInput.bind(this));
    this.node.on("close", this.onClose.bind(this));

    if (this.config.statusReportingEnabled) {
      statusNodesConnector.addReportingNode(this);
    }
  }

  public registerStatusListener(statusNode: StatusNode): boolean {
    const shouldRegister = statusNode.shouldRegister(
      this.config.z,
      this.config.g
    );

    if (shouldRegister) {
      this.statusListeners.add(statusNode);
    }

    return shouldRegister;
  }

  protected onClose() {
    this.cleanup();
  }

  public cleanup() {
    this.resetFilter();
    this.resetDebounce();
    this.statusListeners.clear();
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
    const messageFlow = new NodeMessageFlow(msg, 0, send);

    this.input(messageFlow);

    if (done) {
      done();
    }
  }

  protected input(messageFlow: NodeMessageFlow): void {
    this.debounce(messageFlow);
  }

  protected debounce(messageFlow: NodeMessageFlow): void {
    if (this.config.debounce) {
      const key = this.debounceKey(messageFlow.topic);

      const lastData = messageFlow.clone();

      if (this.debouncing[key]) {
        this.debouncing[key].lastData = lastData;
      } else {
        this.debouncing[key] = {
          timer: null,
          lastData,
        };
      }

      if (!this.isDebounceRunning(key)) {
        if (this.config.debounceLeading) {
          messageFlow.updateAdditionalAttribute("debounced", "leading");
          this.debounced(messageFlow);
        }

        if (this.config.debounceShowStatus) {
          this.viewNodeStatus("Debounce", "blue", "Debounce");
        }

        this.debouncing[key].timer = setTimeout(
          () => {
            if (this.debouncing[key].timer) {
              clearTimeout(this.debouncing[key].timer);
              this.debouncing[key].timer = null;
            }

            if (this.config.debounceShowStatus) {
              this.triggerNodeStatus();
            }

            if (this.config.debounceTrailing) {
              const lastData = this.debouncing[key].lastData.clone();
              lastData.updateAdditionalAttribute("debounced", "trailing");

              this.debounced(lastData);
            }
          },
          convertToMilliseconds(
            this.config.debounceTime,
            this.config.debounceUnit
          )
        );
      }
    } else {
      this.debouncePass(messageFlow);
    }
  }

  protected debounceKey(topic?: string): string {
    return this.config.debounceTopic ? (topic ?? "__default__") : "__default__";
  }

  protected isDebounceRunning(key: string): boolean {
    return Boolean(this.debouncing[key]?.timer);
  }

  protected debouncePass(messageFlow: NodeMessageFlow) {
    messageFlow.updateAdditionalAttribute("debounced", "pass");
    this.debounced(messageFlow);
  }

  protected debounced(messageFlow: NodeMessageFlow) {
    this.sendMsg(messageFlow);
    this.updateStatusAfterDebounce(messageFlow);
  }

  protected updateStatusAfterDebounce(_: NodeMessageFlow) {
    this.nodeStatus = new Date();
  }

  protected cloneMessage(
    msg: NodeMessage,
    deleteMsgId: boolean = true
  ): NodeMessage {
    const clonedMsg = cloneDeep<NodeMessage>(msg);

    if (deleteMsgId) {
      delete clonedMsg._msgid;
    }

    return clonedMsg;
  }

  protected sendMsg(messageFlow: NodeMessageFlow) {
    const topicValue = this.RED.util.evaluateNodeProperty(
      this.config.topic,
      this.config.topicType,
      this.node,
      messageFlow
    );

    messageFlow.topic = topicValue;
    messageFlow.payload =
      messageFlow.payload ?? messageFlow.originalMsg.payload;

    const msg = this.config.newMsg
      ? messageFlow.newMessage()
      : messageFlow.message();

    if (this.config.filterUniquePayload ?? false) {
      const compareKey = this.config.filterkey ?? topicValue ?? "default";

      if (this.filterPayload(this.lastSentPayloads, msg, compareKey)) {
        this.sendMsgToOutput(msg, messageFlow);
        this.lastSentPayloads[compareKey] =
          typeof msg.payload === "object" && msg.payload !== null
            ? cloneDeep<any>(msg.payload)
            : msg.payload;
      }
    } else {
      this.sendMsgToOutput(msg, messageFlow);
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

  protected sendMsgToOutput(msg: NodeMessage, messageFlow: NodeMessageFlow) {
    msg = messageFlow.addAttributes(msg);

    let msgs = Array(this.config.outputs ?? 1).fill(null);
    msgs[messageFlow.output] = msg;

    const send: NodeSendFunction =
      messageFlow.send ?? this.node.send.bind(this.node);
    send(msgs);
  }

  protected get nodeStatus(): NodeStatus {
    return this._nodeStatus;
  }

  protected set nodeStatus(status: NodeStatus) {
    this._nodeStatus = status;
    this.triggerNodeStatus();
  }

  protected triggerNodeStatus() {
    this.viewNodeStatus(this._nodeStatus);
    this.notifyStatusNodes();
  }

  public get statusReportingEnabled(): boolean {
    return this.config.statusReportingEnabled ?? false;
  }

  protected viewNodeStatus(
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

  public notifyStatusNodes() {
    const statusReport: BaseNodeStatus = {
      status: this.nodeStatus,
      statusItem: this.config.statusItem,
      statusText: this.statusTextFormatter(this.nodeStatus),
      statusTextItem: this.config.statusTextItem,
    };
    this.statusListeners.forEach((statusNode) => {
      statusNode.handleStatusReport(statusReport);
    });
  }

  public toString(): string {
    return `${this.constructor.name} [${this.node.id}]`;
  }
}
