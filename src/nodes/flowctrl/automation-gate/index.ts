import { Node, NodeStatusFill } from "node-red";
import { RED } from "../../../globals";
import { BaseNode } from "../base";
import { NodeSendOptions } from "../base/types";
import {
  AutomationGateNodeConfig,
  defaultAutomationGateNodeConfig,
} from "./types";

const lastMessagesKey = "lastMessages";

export class AutomationGateNode extends BaseNode<AutomationGateNodeConfig> {
  private pauseTimer: NodeJS.Timeout | null = null;

  constructor(node: Node, config: AutomationGateNodeConfig) {
    config = { ...defaultAutomationGateNodeConfig, ...config };
    super(node, config, {
      outputs: 2,
      statusOutput: { output: 1, topic: "automation_status" },
    });
  }

  protected onClose(): void {
    super.onClose();
    this.clearPauseTimer();
  }

  protected initialize() {
    this.nodeStatus = this.config.startupState;
  }

  public static create(node: Node, config: AutomationGateNodeConfig) {
    return new AutomationGateNode(node, config);
  }

  protected onInput(msg: any, send: any, done: any) {
    if (msg.gate) {
      switch (msg.gate) {
        case "pause":
          this.pauseGate(msg);
          break;
        case "stop":
          this.stopGate();
          break;
        case "start":
          this.startGate();
          break;
        case "replay":
          this.replayMessages(send);
          break;
        case "reset_filter":
          this.resetFilter();
          break;
        default:
          this.node.error(`Invalid gate command: ${msg.gateway}`);
          break;
      }
    } else {
      this.saveLastMessage(msg);

      if (this.nodeStatus ?? this.config.startupState) {
        this.sendMsg(msg, { send: send });
      }
    }

    if (done) {
      done();
    }
  }

  private pauseGate(msg: any) {
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

  private saveLastMessage(msg: any) {
    if (msg.topic) {
      let lastMessages: Record<string, any> = this.loadRecord(lastMessagesKey);
      lastMessages[msg.topic] = msg;
      this.save(lastMessagesKey, lastMessages);
    }
  }

  private replayMessages(send?: any) {
    this.startGate();
    this.resetFilter();

    let sendOptions: NodeSendOptions = {};
    if (send) {
      sendOptions = { send };
    }

    const lastMessages: Record<string, any> = this.loadRecord(lastMessagesKey);
    for (const topic in lastMessages) {
      if (lastMessages.hasOwnProperty(topic)) {
        this.sendMsg(lastMessages[topic], sendOptions);
      }
    }
  }

  protected statusColor(status: boolean): NodeStatusFill {
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

  protected statusTextFormatter(status: any): string {
    if (status) {
      return this.config.stateOpenLabel ?? "Automated";
    } else {
      return this.config.stateClosedLabel ?? "Manual";
    }
  }
}

export default function createAutomationGateNode(
  this: Node,
  config: AutomationGateNodeConfig
): void {
  RED.nodes.createNode(this, config);
  const node = this;
  AutomationGateNode.create(node, config);
}
