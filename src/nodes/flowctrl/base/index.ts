import { Node, NodeDef, NodeStatusFill } from "node-red";
import { formatDate } from "../../../common/helpers/date";
import { RED } from "../../../globals";

export interface NodeSendOptions {
  send?: any;
  payload?: any;
  output?: number;
  additionalAttributes?: Record<string, any>;
}

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

export interface StatusUpdateConfig {
  output: number;
  topic: string;
}

export interface BaseNodeOptions {
  outputs?: number;
  statusOutput?: StatusUpdateConfig;
}

const nodeStatusKey = "node_status";
const lastSentPayloadsKey = "lastSentPayloads";

export class BaseNode<T extends BaseNodeConfig = BaseNodeConfig> {
  private storage: Record<string, any> = {};

  constructor(
    protected readonly node: Node,
    protected readonly config: T,
    private readonly options: BaseNodeOptions = {}
  ) {
    RED.nodes.createNode(this.node, this.config);
    this.node.on("input", this.onInput.bind(this));
    this.node.on("close", this.onClose.bind(this));

    this.nodeStatus = null;
  }

  public static create(node: Node, config: BaseNodeConfig) {
    return new BaseNode(node, config);
  }

  protected onClose() {
    this.cleanupStorage();
  }

  protected onInput(msg: any, send: any, done: any) {
    this.sendMsg(msg, send);

    if (done) {
      done();
    }
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

    const send = options.send ?? this.node.send.bind(this.node);
    send(msgs);
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
  BaseNode.create(this, config);
}
