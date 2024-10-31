import { Node, NodeStatusFill } from "node-red";
import { clearTimeout } from "timers";
import { RED } from "../../../globals";
import { formatDate } from "../../../helpers/date.helper";
import { convertToMilliseconds } from "../../../helpers/time.helper";
import {
  BaseNodeConfig,
  BaseNodeDebounceData,
  BaseNodeDebounceRunning,
  BaseNodeOptions,
  defaultBaseNodeConfig,
  defaultBaseNodeOptions,
  NodeSendOptions,
} from "./types";

const nodeStatusKey = "node_status";
const lastSentPayloadsKey = "lastSentPayloads";

export class BaseNode<T extends BaseNodeConfig = BaseNodeConfig> {
  protected readonly config: T;
  private readonly options: BaseNodeOptions;

  private storage: Record<string, any> = {};
  private debouncing: Record<string, BaseNodeDebounceRunning> = {};

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
  }

  public static create(node: Node, config: BaseNodeConfig) {
    return new BaseNode(node, config);
  }

  protected onClose() {
    this.cleanupStorage();
  }

  protected initialize() {
    this.nodeStatus = null;
  }

  protected onInput(msg: any, send: any, done: any) {
    this.debounce(msg.topic, { received_msg: msg, send: send });

    if (done) {
      done();
    }
  }

  protected debounce(key: string, data: BaseNodeDebounceData): void {
    if (this.config.debounce) {
      let debounceRunning: BaseNodeDebounceRunning =
        this.debouncing[key] ?? ({} as BaseNodeDebounceRunning);

      debounceRunning.lastData = data;

      if (!debounceRunning.timer) {
        if (this.config.debounceLeading) {
          this.debounceListener(data);
        }

        const nodeStatusSave = this.nodeStatus;

        this.nodeStatus = "debounce";

        debounceRunning.key = key;
        debounceRunning.timer = setTimeout(
          () => {
            let debounceRunningCurrent = this.debouncing[key];

            if (debounceRunningCurrent.timer) {
              clearTimeout(debounceRunningCurrent.timer);
              debounceRunningCurrent.timer = null;
              this.debouncing[key] = debounceRunningCurrent;
            }

            this.nodeStatus = nodeStatusSave;

            if (this.config.debounceTrailing) {
              debounceRunningCurrent.lastData.send = this.node.send.bind(
                this.node
              );
              this.debounceListener(debounceRunningCurrent.lastData);
            }
          },
          convertToMilliseconds(
            this.config.debounceTime,
            this.config.debounceUnit
          )
        );
      }

      this.debouncing[key] = debounceRunning;
    } else {
      this.debounceListener(data);
    }
  }

  protected debounceListener(data: BaseNodeDebounceData) {
    this.sendMsg(data.received_msg, { send: data.send });
    this.nodeStatus = new Date();
  }

  protected get nodeStatus(): any {
    return this.load(nodeStatusKey, null);
  }

  protected set nodeStatus(status: any) {
    const currentStatus = this.load(nodeStatusKey, null);

    this.node.status({
      fill: this.statusColor(status),
      shape: "dot",
      text: this.statusTextFormatter(status),
    });

    if (currentStatus !== status) {
      this.save(nodeStatusKey, status);

      if (this.options.statusOutput) {
        this.sendMsgToOutput(
          { payload: status, topic: this.options.statusOutput.topic },
          { output: this.options.statusOutput.output }
        );
      }
    }
  }

  protected statusColor(status: any): NodeStatusFill {
    let color: NodeStatusFill = "red";
    if (status === null || status === undefined || status === "") {
      color = "grey";
    } else if (status === "debounce") {
      color = "blue";
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

  protected sendMsg(received_msg: any, options: NodeSendOptions = {}) {
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
      let lastSentPayloads: Record<string, any> =
        this.loadRecord(lastSentPayloadsKey);

      if (lastSentPayloads[msg.topic] !== msg.payload) {
        this.sendMsgToOutput(msg, options);
        lastSentPayloads[msg.topic] = msg.payload;
        this.save(lastSentPayloadsKey, lastSentPayloads);
      }
    } else {
      this.sendMsgToOutput(msg, options);
    }
  }

  protected resetFilter(): void {
    this.save(lastSentPayloadsKey, {});
  }

  protected sendMsgToOutput(msg: any, options: NodeSendOptions = {}) {
    if (options.additionalAttributes) {
      Object.assign(msg, options.additionalAttributes);
    }

    let msgs = Array(this.options.outputs ?? 1).fill(null);
    msgs[options.output ?? 0] = msg;

    this.node.send(msgs);

    //    const send = options.send ?? this.node.send.bind(this.node);
    //    send(msgs);
  }

  public save(key: string, value: any) {
    this.storage[key] = value;
  }

  public load(key: string, defaultValue: any): any {
    return this.storage[key] ?? defaultValue;
  }

  public loadRecord(key: string): Record<string, any> {
    return this.load(key, {}) as Record<string, any>;
  }

  public cleanupStorage() {
    this.storage = {};
  }
}

export default function createBaseNode(this: Node, config: BaseNodeConfig) {
  RED.nodes.createNode(this, config);
  const node = this;
  BaseNode.create(node, config);
}
