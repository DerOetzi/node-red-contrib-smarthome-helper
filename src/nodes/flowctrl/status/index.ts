import { Node, NodeAPI } from "node-red";
import { NodeCategory } from "../../types";
import BaseNode from "../base";
import { BaseCategory, BaseNodeDebounceData, NodeStatus } from "../base/types";
import MatchJoinNode from "../match-join";
import { MatchJoinNodeData } from "../match-join/types";
import {
  StatusNodeDef,
  StatusNodeOptions,
  StatusNodeOptionsDefaults,
  StatusNodeTarget,
} from "./types";

export default class StatusNode extends MatchJoinNode<
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
    this.RED.events.once("flows:started", this.onFlowsStarted.bind(this));
    this.RED.events.on("node-status", this.onNodeStatus.bind(this));
    this.nodeStatus = this.config.initialActive;
  }

  protected matched(data: MatchJoinNodeData): void {
    const msg = data.msg;
    const topic = msg.topic;

    if (topic === StatusNodeTarget.activeCondition) {
      if (typeof msg.payload !== "boolean") {
        this.node.error("Invalid payload for active condition");
        return;
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
    }
  }

  private onFlowsStarted(): void {
    this.RED.nodes.eachNode((nodeDef) => {
      const controller = this.getController(nodeDef.id);
      if (controller) {
        this.handleStatusReport(nodeDef.id, controller);
      }
    });
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
