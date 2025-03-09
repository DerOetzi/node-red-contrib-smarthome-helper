import BaseNode from "@base";
import { BaseCategory, BaseNodeDebounceData, NodeStatus } from "@base/types";
import { NodeCategory, NodeDoneFunction, NodeSendFunction } from "@nodes/types";
import { Node, NodeAPI, NodeMessageInFlow } from "node-red";
import {
  StatusNodeDef,
  StatusNodeOptions,
  StatusNodeOptionsDefaults,
} from "./types";

export default class StatusNode extends BaseNode<
  StatusNodeDef,
  StatusNodeOptions
> {
  protected static readonly _nodeCategory: NodeCategory = BaseCategory;
  protected static readonly _nodeType: string = "status";

  private readonly controllerCache: Map<string, BaseNode | null> = new Map();
  private readonly inactiveQueue: Set<string> = new Set();

  constructor(RED: NodeAPI, node: Node, config: StatusNodeDef) {
    super(RED, node, config, StatusNodeOptionsDefaults);
  }

  public registerListeners(): void {
    super.registerListeners();
    this.RED.events.on("node-status", this.onNodeStatus.bind(this));
    this.nodeStatus = this.config.initialActive;
  }

  public onInput(
    msg: NodeMessageInFlow,
    _send: NodeSendFunction,
    done: NodeDoneFunction
  ): void {
    if (typeof msg.payload !== "boolean") {
      return done(
        new Error("Payload must be a boolean value to set the status")
      );
    }

    this.nodeStatus = msg.payload;

    if (this.nodeStatus) {
      this.inactiveQueue.forEach((id) => {
        const controller = this.getController(id);
        if (controller) {
          this.handleStatusReport(id, controller);
        }
      });
      this.inactiveQueue.clear();
    }

    if (done) {
      done();
    }
  }

  private onNodeStatus(input: { id: string; status?: any }): void {
    const controller = this.getController(input.id);
    if (controller) {
      this.handleStatusReport(input.id, controller);
    }
  }

  private getController(id: string): BaseNode | null {
    if (this.controllerCache.has(id)) {
      return this.controllerCache.get(id) || null;
    }

    let controller: BaseNode | null = null;

    const node = this.RED.nodes.getNode(id);
    if (node) {
      if (Object.keys(node).includes("smarthomeHelperController")) {
        controller = (node as any).smarthomeHelperController;
      }

      this.controllerCache.set(id, controller);
    }

    return controller;
  }

  private handleStatusReport(id: string, controller: BaseNode): void {
    const statusReport = controller.statusReport;
    if (statusReport) {
      if (this.nodeStatus) {
        this.debounce({
          msg: { topic: statusReport.statusItem || id },
          payload: statusReport.status,
        });

        if (statusReport.statusTextItem) {
          this.debounce({
            msg: { topic: statusReport.statusTextItem },
            payload: statusReport.statusText,
            output: 1,
          });
        }
      } else {
        this.inactiveQueue.add(id);
      }
    }
  }

  protected updateStatusAfterDebounce(_: BaseNodeDebounceData): void {
    //Do nothing
  }

  protected statusTextFormatter(status: NodeStatus): string {
    return this.RED._(
      `flowctrl.status.status.${status ? "active" : "inactive"}`
    );
  }
}
