import { Node, NodeStatusFill } from "node-red";
import {
  NodeSendHandler,
  NodeSendHandlerOptions,
} from "../../../common/sendhandler";
import { NodeStateHandler } from "../../../common/statehandler";
import { RED } from "../../../globals";
import { BaseNodeConfig } from "../../types";

interface AutomationGateNodeConfig extends BaseNodeConfig {
  startupState: boolean;
  autoReplay: boolean;
  stateOpenLabel: string;
  stateClosedLabel: string;
}

export default function AutomationGateNode(
  this: Node,
  config: AutomationGateNodeConfig
): void {
  RED.nodes.createNode(this, config);

  const node = this;

  const stateHandler = new NodeStateHandler(node, {
    initialize: initializeState,
    statusColor: statusColor,
    statusTextFormatter: statusTextFormatter,
  });

  const sendHandler = new NodeSendHandler(stateHandler, config, 2, {
    output: 1,
    topic: "automation_status",
  });

  let pauseTimer: NodeJS.Timeout | null = null;

  const autoReplay = config.autoReplay ?? true;

  node.on("close", () => {
    clearPauseTimer();
  });

  node.on("input", (msg: any, send: any, done: any) => {
    if (msg.gate) {
      switch (msg.gate) {
        case "pause":
          pauseGate(msg);
          break;
        case "stop":
          stopGate();
          break;
        case "start":
          startGate();
          break;
        case "replay":
          replayMessages(send);
          break;
        case "reset_filter":
          resetFilter();
          break;
        default:
          node.error(`Invalid gate command: ${msg.gate}`);
          break;
      }
    } else {
      saveLastMessage(msg);

      if (stateHandler.nodeStatus ?? config.startupState ?? true) {
        sendHandler.sendMsg(msg, { send: send });
      }
    }

    if (done) {
      done();
    }
  });

  function initializeState(): void {
    stateHandler.nodeStatus = config.startupState ?? true;
  }

  function resetFilter(): void {
    sendHandler.resetFilter();
  }

  function stopGate() {
    stateHandler.nodeStatus = false;
    resetFilter();
    clearPauseTimer();
  }

  function startGate() {
    clearPauseTimer();
    stateHandler.nodeStatus = true;
  }

  function pauseGate(msg: any) {
    if (typeof msg.pause !== "number" || msg.pause <= 0) {
      node.error("Invalid or missing pause duration");
      return;
    }

    stopGate();

    pauseTimer = setTimeout(() => {
      startGate();

      if (autoReplay) {
        replayMessages();
      }
    }, msg.pause);
  }

  function saveLastMessage(msg: any) {
    if (msg.topic) {
      let lastMessages: Record<string, any> = stateHandler.getFromContext(
        "lastMessages",
        {}
      );
      lastMessages[msg.topic] = msg;
      stateHandler.setToContext("lastMessages", lastMessages);
    }
  }

  function replayMessages(send?: any) {
    startGate();

    let sendOptions: NodeSendHandlerOptions = {};
    if (send) {
      sendOptions = { send };
    }

    const lastMessages: Record<string, any> = stateHandler.getFromContext(
      "lastMessages",
      {}
    );
    for (const topic in lastMessages) {
      if (lastMessages.hasOwnProperty(topic)) {
        sendHandler.sendMsg(lastMessages[topic], sendOptions);
      }
    }
  }

  function clearPauseTimer() {
    if (pauseTimer) {
      clearTimeout(pauseTimer);
      pauseTimer = null;
    }
  }

  function statusColor(status: boolean): NodeStatusFill {
    let color: NodeStatusFill = "red";
    if (status === null || status === undefined) {
      color = "grey";
    } else if (status) {
      color = "green";
    } else if (pauseTimer !== null) {
      color = "yellow";
    }

    return color;
  }

  function statusTextFormatter(status: any): string {
    if (status) {
      return config.stateOpenLabel ?? "Automated";
    } else {
      return config.stateClosedLabel ?? "Manual";
    }
  }
}
