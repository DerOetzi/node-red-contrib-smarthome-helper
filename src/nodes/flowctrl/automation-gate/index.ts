import _ from "lodash";
import { Node, NodeStatusFill } from "node-red";
import { NodeType } from "../../types";
import BaseNode from "../base";
import { BaseNodeDebounceData, NodeSendOptions } from "../base/types";
import {
  AutomationGateNodeConfig,
  AutomationGateNodeType,
  defaultAutomationGateNodeConfig,
} from "./types";

export default class AutomationGateNode extends BaseNode<AutomationGateNodeConfig> {
  private pauseTimer: NodeJS.Timeout | null = null;
  private lastMessages: Record<string, any> = {};

  static get type(): NodeType {
    return AutomationGateNodeType;
  }

  constructor(node: Node, config: AutomationGateNodeConfig) {
    config = { ...defaultAutomationGateNodeConfig, ...config };
    super(node, config, {
      statusOutput: { output: 1, topic: "automation_status" },
      initializeDelay: config.statusDelay,
    });
  }

  protected initialize() {
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

      this.debounce({ received_msg: msg, send: send });
    }

    if (done) {
      done();
    }
  }

  protected debounceListener(data: BaseNodeDebounceData): void {
    if (this.nodeStatus ?? this.config.startupState) {
      this.sendMsg(data.received_msg, { send: data.send });
    }
  }

  protected sendMsgToOutput(msg: any, options: NodeSendOptions): void {
    if (this.config.setAutomationInProgress && (options.output ?? 0) === 0) {
      this.setAutomationInProgress();
    }

    super.sendMsgToOutput(msg, options);
  }

  private setAutomationInProgress() {
    this.node
      .context()
      .flow.set(`automation_${this.config.automationProgressId}`, true);
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
      this.lastMessages[msg.topic] = _.cloneDeep(msg);
      delete this.lastMessages[msg.topic]._msgid;
    }
  }

  private replayMessages(send?: any) {
    this.startGate();
    this.resetFilter();

    for (const topic in this.lastMessages) {
      if (this.lastMessages.hasOwnProperty(topic)) {
        this.debounce({
          received_msg: _.cloneDeep(this.lastMessages[topic]),
          send: send,
        });
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
    if (status === true) {
      status = this.config.stateOpenLabel ?? "Automated";
    } else if (status === false) {
      status = this.config.stateClosedLabel ?? "Manual";
    }

    return status;
  }
}
