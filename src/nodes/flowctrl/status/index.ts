import { Node, NodeAPI } from "node-red";
import { NodeCategory } from "../../types";
import {
  BaseCategory,
  BaseNodeDebounceData,
  BaseNodeStatus,
  NodeStatus,
} from "../base/types";
import MatchJoinNode from "../match-join";
import { MatchJoinNodeData } from "../match-join/types";
import { StatusNodesConnector } from "./connector";
import {
  StatusNodeDef,
  StatusNodeOptions,
  StatusNodeOptionsDefaults,
  StatusNodeScope,
  StatusNodeTarget,
} from "./types";

export default class StatusNode extends MatchJoinNode<
  StatusNodeDef,
  StatusNodeOptions
> {
  protected static readonly _nodeCategory: NodeCategory = BaseCategory;
  protected static readonly _nodeType: string = "status";

  private readonly inactiveQueue: Map<string, BaseNodeStatus> = new Map();

  constructor(RED: NodeAPI, node: Node, config: StatusNodeDef) {
    super(RED, node, config, StatusNodeOptionsDefaults);
    this.nodeStatus = this.config.initialActive;
  }

  public register(statusNodesConnector: StatusNodesConnector): void {
    super.register(statusNodesConnector);
    statusNodesConnector.addStatusNode(this);
  }

  public shouldRegister(flowId: string, groupId?: string): boolean {
    let shouldRegister = this.config.scope === StatusNodeScope.global;

    shouldRegister =
      shouldRegister ||
      (this.config.scope === StatusNodeScope.flow && flowId === this.config.z);
    shouldRegister =
      shouldRegister ||
      (this.config.scope === StatusNodeScope.group &&
        groupId === this.config.g);

    return shouldRegister;
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
        this.inactiveQueue.forEach((statusReport) => {
          this.handleStatusReport(statusReport);
        });
        this.inactiveQueue.clear();
      }
    }
  }

  public handleStatusReport(statusReport: BaseNodeStatus): void {
    if (this.nodeStatus) {
      this.debounce({
        msg: { topic: statusReport.statusItem },
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
      this.inactiveQueue.set(statusReport.statusItem, statusReport);
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
