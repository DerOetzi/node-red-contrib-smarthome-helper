import { Node, NodeStatusFill } from "node-red";
import { formatDate } from "./helpers/date";
import { NodeSendHandler } from "./sendhandler";
import { CommonNodeConfig } from "../nodes/flowctrl/common";

export interface NodeStateHandlerOptions {
  initialize?: () => void;
  statusColor?: (status: any) => NodeStatusFill;
  statusTextFormatter?: (status: any) => string;
}

export interface NodeStatusSendConfig {
  sendHandler?: NodeSendHandler;
  output: number;
  topic: string;
}

const nodeStatusKey = "node_status";

export class NodeStateHandler {
  private stateStorage: Record<string, any> = {};

  private readonly options: NodeStateHandlerOptions;
  private statusSendConfig?: NodeStatusSendConfig;

  constructor(
    public readonly node: Node,
    public readonly config: CommonNodeConfig,
    options: NodeStateHandlerOptions = {}
  ) {
    const defaultOptions: NodeStateHandlerOptions = {
      statusColor: this.statusColorDefault,
      statusTextFormatter: this.statusTextFormatterDefault,
    };

    this.options = { ...defaultOptions, ...options };

    this.cleanupNodeContext();

    this.node.on("close", this.onClose.bind(this));

    this.nodeStatus = null;

    if (this.options.initialize) {
      setTimeout(() => {
        if (this.options.initialize) {
          this.options.initialize();
        }
      }, 100);
    }
  }

  public onClose() {
    this.cleanupNodeContext();
  }

  public cleanupNodeContext() {
    this.stateStorage = {};
  }

  public getFromContext(key: string, defaultValue: any = null): any {
    return this.stateStorage[key] ?? defaultValue;
  }

  public getRecordFromContext(key: string): Record<string, any> {
    return this.getFromContext(key, {}) as Record<string, any>;
  }

  public setToContext(key: string, value: any) {
    this.stateStorage[key] = value;
  }

  public removeFromContext(key: string) {
    this.stateStorage[key] = null;
  }

  public registerStatusOutput(statusSendConfig: NodeStatusSendConfig) {
    this.statusSendConfig = statusSendConfig;
  }

  set nodeStatus(status: any) {
    const currentStatus = this.getFromContext(nodeStatusKey, null);

    let fill: NodeStatusFill = "grey";
    if (this.options?.statusColor) {
      fill = this.options.statusColor(status);
    }

    let text = "";
    if (this.options?.statusTextFormatter) {
      text = this.options.statusTextFormatter(status);
    }

    this.node.status({
      fill: fill,
      shape: "dot",
      text: text,
    });

    if (currentStatus !== status) {
      this.setToContext(nodeStatusKey, status);

      this.statusSendConfig?.sendHandler?.sendMsgToOutput(
        { payload: status, topic: this.statusSendConfig.topic },
        { output: this.statusSendConfig.output }
      );
    }
  }

  private statusColorDefault(status: any): NodeStatusFill {
    let color: NodeStatusFill = "red";
    if (status === null || status === undefined || status === "") {
      color = "grey";
    } else if (status) {
      color = "green";
    }

    return color;
  }

  private statusTextFormatterDefault(status: any): string {
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

  get nodeStatus(): any {
    return this.getFromContext(nodeStatusKey, null);
  }
}
