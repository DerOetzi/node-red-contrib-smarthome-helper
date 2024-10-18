import { NodeAPI, Node, NodeDef } from "node-red";

interface GateControlNodeConfig extends NodeDef {
  delay: number;
  gateCommand: string;
  pauseTime?: number; // Optional pause time property
  pauseUnit?: string; // Time unit for the pause property
}

module.exports = function (RED: NodeAPI) {
  function GateControlNode(this: Node, config: GateControlNodeConfig): void {
    RED.nodes.createNode(this, config);
    const node = this;
    const delay = config.delay || 100;
    const gateCommand = config.gateCommand || "start";

    let pauseTimeInMs = 0;
    if (gateCommand === "pause" && config.pauseTime) {
      const pauseUnits: Record<string, any> = {
        s: 1000,
        m: 1000 * 60,
        h: 1000 * 60 * 60,
        d: 1000 * 60 * 60 * 24,
      };
      const unit = config.pauseUnit ?? "s";
      pauseTimeInMs = config.pauseTime * (pauseUnits[unit] || 1000);
    }

    node.on("input", (msg: any) => {
      const gateControlMsg: any = { gate: gateCommand, originalMsg: msg };
      if (gateCommand === "pause") {
        gateControlMsg.pause = pauseTimeInMs;
      }
      node.send([gateControlMsg, null]);

      if (msg.trigger === true) {
        return;
      }

      setTimeout(() => {
        node.send([null, msg]);
      }, delay);
    });
  }

  RED.nodes.registerType("gate-control", GateControlNode);

  RED.httpAdmin.post(
    "/smarthomehelper/automation_gate/control/:id",
    RED.auth.needsPermission("inject.write"),
    function (req, res) {
      const node = RED.nodes.getNode(req.params.id);
      if (node != null) {
        try {
          if (req.body?.trigger) {
            node.receive(req.body);
            res.sendStatus(200);
          } else {
            res.sendStatus(400);
          }
        } catch (err) {
          res.sendStatus(500);
          node.error(
            RED._("inject.failed", { error: (err as Error).toString() })
          );
        }
      } else {
        res.sendStatus(404);
      }
    }
  );
};
