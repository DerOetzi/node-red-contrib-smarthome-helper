import { Node, NodeAPI, NodeMessage, NodeStatusFill } from "node-red";
import { NodeCategory, NodeSendFunction } from "../../types";
import BaseNode from "../base";
import Migration from "../base/migration";
import { NodeMessageFlow, NodeStatus } from "../base/types";
import AutomationGateMigration from "./migration";
import {
  AutomationGateCategory,
  AutomationGateCommand,
  AutomationGateNodeDef,
  AutomationGateNodeMessage,
  AutomationGateNodeOptions,
  AutomationGateNodeOptionsDefaults,
} from "./types";

export default class AutomationGateNode extends BaseNode<
  AutomationGateNodeDef,
  AutomationGateNodeOptions
> {
  protected static readonly _nodeCategory: NodeCategory =
    AutomationGateCategory;
  protected static readonly _nodeType: string = "automation-gate";
  protected static readonly _migration: Migration<any> =
    new AutomationGateMigration();

  private pauseTimer: NodeJS.Timeout | null = null;
  private lastMessages: Record<string, NodeMessageFlow> = {};

  constructor(RED: NodeAPI, node: Node, config: AutomationGateNodeDef) {
    super(RED, node, config, AutomationGateNodeOptionsDefaults);
    this.nodeStatus = this.config.startupState;
  }

  protected onClose(): void {
    super.onClose();
    this.cleanupStorage();
    this.clearPauseTimer();
  }

  public cleanupStorage() {
    this.lastMessages = {};

    if (this.config.setAutomationInProgress) {
      this.node
        .context()
        .flow.set(`automation_${this.config.automationProgressId}`, false);
    }
  }

  protected input(messageFlow: NodeMessageFlow) {
    const msg = messageFlow.originalMsg;

    if ("gate" in msg) {
      const gateMsg = msg as AutomationGateNodeMessage;

      switch (gateMsg.gate) {
        case AutomationGateCommand.Pause:
          this.pauseGate(gateMsg);
          break;
        case AutomationGateCommand.Stop:
          this.stopGate();
          break;
        case AutomationGateCommand.Start:
          this.startGate();
          break;
        case AutomationGateCommand.Replay:
          this.replayMessages(messageFlow.send);
          break;
        case AutomationGateCommand.ResetFilter:
          this.resetFilter();
          break;
        default:
          this.node.error(`Invalid gate command: ${gateMsg.gate}`);
          break;
      }
    } else {
      this.saveLastMessage(messageFlow);
      this.debounce(messageFlow);
    }
  }

  protected debounced(messageFlow: NodeMessageFlow): void {
    if (this.nodeStatus ?? this.config.startupState) {
      this.sendMsg(messageFlow);
    }
  }

  protected sendMsgToOutput(
    msg: NodeMessage,
    messageFlow: NodeMessageFlow
  ): void {
    if (this.config.setAutomationInProgress && messageFlow.output === 0) {
      this.setAutomationInProgress();
    }

    super.sendMsgToOutput(msg, messageFlow);
  }

  private setAutomationInProgress() {
    this.node
      .context()
      .flow.set(`automation_${this.config.automationProgressId}`, true);
  }

  private pauseGate(msg: AutomationGateNodeMessage) {
    if (typeof msg.pause !== "number" || msg.pause <= 0) {
      this.node.error("Invalid or missing pause duration");
      return;
    }

    this.stopGate();

    this.pauseTimer = setTimeout(() => {
      this.startGate();

      if (this.config.autoReplay) {
        this.replayMessages();
      }
    }, msg.pause);
  }

  private stopGate() {
    this.nodeStatus = false;
    this.resetFilter();
    this.clearPauseTimer();
  }

  private clearPauseTimer() {
    if (this.pauseTimer) {
      clearTimeout(this.pauseTimer);
      this.pauseTimer = null;
    }
  }

  private startGate() {
    this.clearPauseTimer();
    this.nodeStatus = true;
  }

  private saveLastMessage(messageFlow: NodeMessageFlow) {
    if (messageFlow.topic) {
      this.lastMessages[messageFlow.topic] = messageFlow.clone();
    }
  }

  private replayMessages(send?: NodeSendFunction) {
    this.startGate();
    this.resetFilter();

    for (const topic in this.lastMessages) {
      if (this.lastMessages.hasOwnProperty(topic)) {
        this.debounce(this.lastMessages[topic].clone());
      }
    }
  }

  protected statusColor(status: NodeStatus): NodeStatusFill {
    let color: NodeStatusFill = "red";
    if (status === null || status === undefined) {
      color = "grey";
    } else if (status) {
      color = "green";
    } else if (this.pauseTimer !== null) {
      color = "yellow";
    }

    return color;
  }

  protected statusTextFormatter(status: NodeStatus): string {
    if (status === true) {
      status = this.config.stateOpenLabel ?? "Automated";
    } else if (status === false) {
      status = this.config.stateClosedLabel ?? "Manual";
    }

    return String(status);
  }
}
