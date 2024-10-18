import { NodeAPI, Node, NodeDef, NodeStatusFill } from "node-red";

interface GateNodeConfig extends NodeDef {
  startupState: boolean;
  autoReplay: boolean;
  filterUniquePayload: boolean;
}

module.exports = function (RED: NodeAPI) {
  function AutomationGateNode(this: Node, config: GateNodeConfig): void {
    RED.nodes.createNode(this, config);
    const node = this;

    let pauseTimer: NodeJS.Timeout | null = null;

    changeState(config.startupState ?? true);

    const autoReplay = config.autoReplay ?? true;
    const filterUniquePayload = config.filterUniquePayload ?? false;

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
          if (filterUniquePayload) {
            sendIfChanged(msg);
          } else {
            node.send([msg, null]);
          }
        }
      }
    });

    function sendIfChanged(msg: any) {
      if (msg.topic) {
        let lastSentPayloads: Record<string, any> =
          node.context().get("lastSentPayloads") || {};

        if (lastSentPayloads[msg.topic] !== msg.payload) {
          node.send([msg, null]);
          lastSentPayloads[msg.topic] = msg.payload;
          node.context().set("lastSentPayloads", lastSentPayloads);
        }
      }
    }

    function resetFilter() {
      node.context().set("lastSentPayloads", {});
    }

    function stopGate() {
      changeState(false);
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
        changeState(true);

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
      const lastMessages: Record<string, any> =
        node.context().get("lastMessages") || {};
      for (const topic in lastMessages) {
        if (lastMessages.hasOwnProperty(topic)) {
          node.send([lastMessages[topic], null]);
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
          text: state ? "Automated" : "Manual",
        });
        node.send([null, { payload: state, topic: "automation_state" }]);
      }
    }

    function actualState(): boolean {
      return node.context().get("state") as boolean;
    }
  }

  RED.nodes.registerType("automation-gate", AutomationGateNode);
};
