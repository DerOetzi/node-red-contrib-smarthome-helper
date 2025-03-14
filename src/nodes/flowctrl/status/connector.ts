import { NodeAPI } from "node-red";
import StatusNode from ".";
import BaseNode from "../base";

export class StatusNodesConnector {
  private readonly statusNodes: Set<StatusNode> = new Set();
  private readonly reportingNodes: Set<BaseNode> = new Set();

  constructor(private readonly RED: NodeAPI) {}

  public addStatusNode(statusNode: StatusNode): void {
    if (this.statusNodes.size === 0) {
      this.RED.events.on("flows:started", this.onFlowsStarted.bind(this));
    }

    this.statusNodes.add(statusNode);
    this.reportingNodes.forEach((reportingNode) => {
      reportingNode.registerStatusListener(statusNode);
    });
  }

  public addReportingNode(reportingNode: BaseNode): void {
    this.reportingNodes.add(reportingNode);
    this.statusNodes.forEach((statusNode) => {
      reportingNode.registerStatusListener(statusNode);
    });
  }

  private onFlowsStarted(): void {
    this.reportingNodes.forEach((reportingNode) => {
      reportingNode.notifyStatusNodes();
    });
  }
}
