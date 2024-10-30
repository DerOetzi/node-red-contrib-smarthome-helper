import { Node } from "node-red";
import { NodeSendHandler } from "../../../common/sendhandler";
import { NodeStateHandler } from "../../../common/statehandler";
import { RED } from "../../../globals";
import { CommonNodeConfig } from "../common";

interface GateControlNodeConfig extends CommonNodeConfig {
  delay: number;
  gateCommand: string;
  pauseTime?: number;
  pauseUnit?: string;
}

export default function GateControlNode(
  this: Node,
  config: GateControlNodeConfig
): void {
  RED.nodes.createNode(this, config);

  const node = this;

  const stateHandler = new NodeStateHandler(node, config);

  const sendHandler = new NodeSendHandler(stateHandler, 2);

  const gateCommand = config.gateCommand || "start";
  const delay = config.delay || 100;

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

  node.on("input", (msg: any, send: any, done: any) => {
    const gateControlMsg: any = { gate: gateCommand, originalMsg: msg };
    if (gateCommand === "pause") {
      gateControlMsg.pause = pauseTimeInMs;
    }
    sendHandler.sendMsgToOutput(gateControlMsg, { send, output: 1 });

    setTimeout(() => {
      sendHandler.sendMsg(msg);
      stateHandler.nodeStatus = new Date();
    }, delay);

    if (done) {
      done();
    }
  });
}
