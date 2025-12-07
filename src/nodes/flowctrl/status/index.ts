import { Node, NodeAPI } from "node-red";
import { NodeCategory } from "../../types";
import {
  BaseCategory,
  BaseNodeStatus,
  NodeMessageFlow,
  NodeStatus,
} from "../base/types";
import MatchJoinNode from "../match-join";
import { StatusNodesConnector } from "./connector";
import {
  StatusNodeDef,
  StatusNodeOptions,
  StatusNodeOptionsDefaults,
  StatusNodeScope,
  StatusNodeTarget,
} from "./types";
import Migration from "../base/migration";
import StatusNodeMigration from "./migration";

export default class StatusNode extends MatchJoinNode<
  StatusNodeDef,
  StatusNodeOptions
> {
  protected static readonly _nodeCategory: NodeCategory = BaseCategory;
  protected static readonly _nodeType: string = "status";
  protected static readonly _migration: Migration<any> =
    new StatusNodeMigration();

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

  protected matched(messageFlow: NodeMessageFlow): void {
    const topic = messageFlow.topic;

    if (topic === StatusNodeTarget.activeCondition) {
      if (typeof messageFlow.payload !== "boolean") {
        this.node.error("Invalid payload for active condition");
        return;
      }

      this.nodeStatus = messageFlow.payload;

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
      this.debounce(
        new NodeMessageFlow(
          {
            topic: statusReport.statusItem,
            payload: statusReport.status,
          },
          0
        )
      );

      if (statusReport.statusTextItem) {
        this.debounce(
          new NodeMessageFlow(
            {
              topic: statusReport.statusTextItem,
              payload: statusReport.statusText,
            },
            1
          )
        );
      }
    } else {
      this.inactiveQueue.set(statusReport.statusItem, statusReport);
    }
  }

  protected updateStatusAfterDebounce(_: NodeMessageFlow): void {
    //Do nothing
  }

  protected statusTextFormatter(status: NodeStatus): string {
    return this.RED._(
      `flowctrl.status.state.${status ? "active" : "inactive"}`
    );
  }
}
