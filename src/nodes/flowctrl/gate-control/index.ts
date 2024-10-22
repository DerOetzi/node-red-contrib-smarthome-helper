import { Node } from "node-red";
import { RED } from "../../../globals";
import { BaseNodeConfig } from "../../types";
import { SendHandler } from "../../../common/sendhandler";

interface GateControlNodeConfig extends BaseNodeConfig {
  delay: number;
  gateCommand: string;
  pauseTime?: number; // Optional pause time property
  pauseUnit?: string; // Time unit for the pause property
}

export default function GateControlNode(
  this: Node,
  config: GateControlNodeConfig
): void {
  RED.nodes.createNode(this, config);
  const node = this;
  const sendHandler = new SendHandler(node, config, 2);

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

  node.on("input", (msg: any) => {
    const gateControlMsg: any = { gate: gateCommand, originalMsg: msg };
    if (gateCommand === "pause") {
      gateControlMsg.pause = pauseTimeInMs;
    }
    sendHandler.sendMsgToOutput(gateControlMsg, 1);

    setTimeout(() => {
      sendHandler.sendMsg(msg);
    }, delay);
  });
}