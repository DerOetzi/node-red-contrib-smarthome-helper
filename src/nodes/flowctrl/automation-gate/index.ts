import { Node, NodeStatusFill } from "node-red";
import { SendHandler } from "../../../common/sendhandler";
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
  const sendHandler = new SendHandler(node, config, 2);

  let pauseTimer: NodeJS.Timeout | null = null;

  RED.events.on("flows:started", initializeState);

  const autoReplay = config.autoReplay ?? true;

  node.on("input", (msg: any) => {
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
          replayMessages();
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

      if (actualState()) {
        sendHandler.sendMsg(msg);
      }
    }
  });

  function initializeState() {
    RED.events.removeListener("flows:started", initializeState);
    setTimeout(() => {
      changeState(config.startupState ?? true);
    }, 5000);
  }

  function resetFilter() {
    sendHandler.resetFilter();
  }

  function stopGate() {
    changeState(false);
    sendHandler.resetFilter();
    clearPauseTimer();
  }

  function startGate() {
    clearPauseTimer();
    changeState(true);
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
      let lastMessages: Record<string, any> =
        node.context().get("lastMessages") || {};
      lastMessages[msg.topic] = msg;
      node.context().set("lastMessages", lastMessages);
    }
  }

  function replayMessages() {
    startGate();

    const lastMessages: Record<string, any> =
      node.context().get("lastMessages") || {};
    for (const topic in lastMessages) {
      if (lastMessages.hasOwnProperty(topic)) {
        sendHandler.sendMsg(lastMessages[topic]);
      }
    }
  }

  function clearPauseTimer() {
    if (pauseTimer) {
      clearTimeout(pauseTimer);
      pauseTimer = null;
    }
  }

  function changeState(state: boolean) {
    const currentState = actualState();
    if (currentState !== state) {
      node.context().set("state", state);

      let color: NodeStatusFill = "red";
      if (state) {
        color = "green";
      } else if (pauseTimer !== null) {
        color = "yellow";
      }

      node.status({
        fill: color,
        shape: "dot",
        text: state
          ? (config.stateOpenLabel ?? "Automated")
          : (config.stateClosedLabel ?? "Manual"),
      });

      sendHandler.sendMsgToOutput(
        { payload: state, topic: "automation_state" },
        1
      );
    }
  }

  function actualState(): boolean {
    return node.context().get("state") as boolean;
  }
}
