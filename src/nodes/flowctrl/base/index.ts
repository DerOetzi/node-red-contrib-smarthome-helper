import _ from "lodash";
import { Node, NodeMessage, NodeMessageInFlow, NodeStatusFill } from "node-red";
import { RED } from "../../../globals";
import { formatDate } from "../../../helpers/date.helper";
import { convertToMilliseconds } from "../../../helpers/time.helper";
import { NodeRedDone, NodeRedSend } from "../../../types";
import { NodeType } from "../../types";
import {
  BaseNodeConfig,
  BaseNodeDebounceData,
  BaseNodeDebounceRunning,
  BaseNodeOptions,
  BaseNodeType,
  defaultBaseNodeConfig,
  defaultBaseNodeOptions,
  NodeSendOptions,
} from "./types";

export default class BaseNode<T extends BaseNodeConfig = BaseNodeConfig> {
  protected readonly config: T;
  private readonly options: BaseNodeOptions;

  private _nodeStatus: any;
  private lastSentPayloads: Record<string, any> = {};
  private readonly debouncing: Record<string, BaseNodeDebounceRunning>;

  public static createFunction() {
    const NodeClass = this;
    return function (this: Node, config: any) {
      RED.nodes.createNode(this, config);
      const node = this;
      NodeClass.instance(node, config);
    };
  }

  public static instance(node: Node, config: any) {
    return new this(node, config);
  }

  static get type(): NodeType {
    return BaseNodeType;
  }

  constructor(
    protected readonly node: Node,
    config: T,
    options: BaseNodeOptions = {}
  ) {
    this.config = { ...defaultBaseNodeConfig, ...config };

    this.node.on("input", this.onInput.bind(this));
    this.node.on("close", this.onClose.bind(this));

    this.options = { ...defaultBaseNodeOptions, ...options };

    setTimeout(() => this.initialize(), this.options.initializeDelay);

    this.debouncing = {};
  }

  protected onClose() {
    this.cleanupStorage();
  }

  protected initialize() {
    this.nodeStatus = null;
  }

  protected onInput(
    msg: NodeMessageInFlow,
    send: NodeRedSend,
    done: NodeRedDone
  ) {
    this.debounce({ msg: msg, send });

    if (done) {
      done();
    }
  }

  protected debounce(data: BaseNodeDebounceData): void {
    if (this.config.debounce) {
      const key = this.config.debounceTopic
        ? (data.msg.topic ?? "default")
        : "default";

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
      this.debounceListener(data);
    }
  }

  protected debounceListener(data: BaseNodeDebounceData) {
    this.sendMsg(data.msg, data);
    this.updateStatusAfterDebounce(data);
  }

  protected cloneMessage(msg: NodeMessage): NodeMessage {
    const clonedMsg = _.cloneDeep(msg);
    delete clonedMsg._msgid;
    return clonedMsg;
  }

  protected updateStatusAfterDebounce(_: BaseNodeDebounceData) {
    this.nodeStatus = new Date();
  }

  protected get nodeStatus(): any {
    return this._nodeStatus;
  }

  protected set nodeStatus(status: any) {
    const currentStatus = this._nodeStatus;

    this.setNodeStatus(status);

    if (currentStatus !== status) {
      this._nodeStatus = status;
      if (
        this.options.statusOutput &&
        (this.options.statusOutput.automatic ?? true)
      ) {
        this.sendStatus(status);
      }
    }
  }

  protected sendStatus(status: any) {
    if (this.options.statusOutput) {
      this.sendMsgToOutput(
        { payload: status, topic: this.options.statusOutput.topic },
        { output: this.options.statusOutput.output }
      );
    }
  }

  private setNodeStatus(status: any, color?: NodeStatusFill, text?: string) {
    this.node.status({
      fill: color ?? this.statusColor(status),
      shape: "dot",
      text: text ?? this.statusTextFormatter(status),
    });
  }

  protected statusColor(status: any): NodeStatusFill {
    let color: NodeStatusFill = "red";
    if (status === null || status === undefined || status === "") {
      color = "grey";
    } else if (status) {
      color = "green";
    }

    return color;
  }

  protected statusTextFormatter(status: any): string {
    let text = "";
    if (status === null || status === undefined || status === "") {
      text = "unknown";
    } else if (status instanceof Date) {
      text = formatDate(status);
    } else {
      text = status.toString();
    }

    return text;
  }

  protected sendMsg(received_msg: NodeMessage, options: NodeSendOptions = {}) {
    const topicValue = RED.util.evaluateNodeProperty(
      this.config.topic,
      this.config.topicType,
      this.node,
      received_msg
    );
    const payload = options.payload ?? received_msg.payload;

    let msg: any;
    if (this.config.newMsg ?? false) {
      msg = { payload: payload, topic: topicValue };
    } else {
      msg = received_msg;
      msg.payload = payload;
      msg.topic = topicValue;
    }

    if (this.config.filterUniquePayload ?? false) {
      const compareKey = this.options.filterkey ?? msg.topic;

      if (this.filterPayload(this.lastSentPayloads, msg, compareKey)) {
        this.sendMsgToOutput(msg, options);
        this.lastSentPayloads[compareKey] =
          typeof msg.payload === "object" && msg.payload !== null
            ? _.cloneDeep(msg.payload)
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
      return !_.isEqual(lastSentPayloads[compareKey], msg.payload);
    }

    return lastSentPayloads[compareKey] !== msg.payload;
  }

  protected resetFilter(): void {
    this.lastSentPayloads = {};
  }

  protected sendMsgToOutput(msg: NodeMessage, options: NodeSendOptions = {}) {
    if (options.additionalAttributes) {
      Object.assign(msg, options.additionalAttributes);
    }

    let msgs = Array(this.config.outputs ?? 1).fill(null);
    msgs[options.output ?? 0] = msg;

    this.node.send(msgs);

    // TODO   const send = options.send ?? this.node.send.bind(this.node);
    //    send(msgs);
  }

  public cleanupStorage() {
    this.resetFilter();
  }
}
