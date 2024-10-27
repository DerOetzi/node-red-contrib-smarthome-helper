import { Node, NodeContext, NodeStatusFill } from "node-red";
import { RED } from "../globals";
import { NodeSendHandler } from "./sendhandler";
import { formatDate } from "./helpers/date";

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
  private static readonly nodesToInitialize: (() => void)[] = [];

  private readonly context: NodeContext;

  private readonly options: NodeStateHandlerOptions;
  private statusSendConfig?: NodeStatusSendConfig;

  constructor(
    public readonly node: Node,
    options: NodeStateHandlerOptions = {}
  ) {
    const defaultOptions: NodeStateHandlerOptions = {
      statusColor: this.statusColorDefault,
      statusTextFormatter: this.statusTextFormatterDefault,
    };

    this.options = { ...defaultOptions, ...options };

    this.context = node.context();
    this.cleanupNodeContext();

    this.node.on("close", this.onClose.bind(this));
    this.registerNodeForInitialization();

    this.nodeStatus = null;
  }

  public onClose() {
    this.cleanupNodeContext();
  }

  public cleanupNodeContext() {
    let keys = this.context.keys();
    for (const element of keys) {
      this.context.set(element, null);
    }
  }

  private registerNodeForInitialization() {
    if (this.options.initialize) {
      NodeStateHandler.nodesToInitialize.push(this.options.initialize);
    }

    if (NodeStateHandler.nodesToInitialize.length === 1) {
      RED.events.on("flows:started", () => {
        setTimeout(() => {
          NodeStateHandler.nodesToInitialize.forEach((initialize) => {
            initialize();
          });
        }, 2000);
      });
    }
  }

  public getFromContext(key: string, defaultValue: any = null): any {
    return this.context.get(key) ?? defaultValue;
  }

  public getRecordFromContext(key: string): Record<string, any> {
    return this.getFromContext(key, {}) as Record<string, any>;
  }

  public setToContext(key: string, value: any) {
    this.context.set(key, value);
  }

  public removeFromContext(key: string) {
    this.context.set(key, null);
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
