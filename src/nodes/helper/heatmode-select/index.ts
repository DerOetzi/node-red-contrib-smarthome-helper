import { Node } from "node-red";
import BaseNode from "../../flowctrl/base";
import { NodeType } from "../../types";
import {
  defaultHeatModeSelectNodeConfig,
  HeatModeSelectNodeConfig,
  HeatModeSelectNodeType,
} from "./types";

export default class HeatModeSelectNode extends BaseNode<HeatModeSelectNodeConfig> {
  constructor(node: Node, config: HeatModeSelectNodeConfig) {
    config = { ...defaultHeatModeSelectNodeConfig, ...config };
    super(node, config, { outputs: 3 });
  }

  static get type(): NodeType {
    return HeatModeSelectNodeType;
  }

  protected onInput(msg: any, send: any, done: any): void {
    let targetTemperature: number = 8;

    switch (msg.payload.mode) {
      case this.config.comfortMode:
        targetTemperature = msg.payload.comfortTemp;
        break;
      case this.config.ecoMode:
        targetTemperature = msg.payload.comfortTemp + msg.payload.ecoTemp;
        break;
      case this.config.frostProtectionMode:
        break;
      case this.config.boostMode:
        targetTemperature = msg.payload.comfortTemp + 5;
        break;
      default:
        this.node.error("Invalid mode: " + msg.payload.mode);
        return;
    }

    this.debounce({
      received_msg: msg,
      send,
      result: { input: msg.payload, targetTemp: targetTemperature },
    });

    if (done) {
      done();
    }
  }

  protected debounceListener(data: any): void {
    const targetTemperature = data.result.targetTemp;
    const input = data.result.input;

    this.sendMsg(data.received_msg, {
      send: data.send,
      payload: targetTemperature,
      additionalAttributes: { params: input },
    });

    this.nodeStatus = `${input.mode} ${targetTemperature} °C`;
  }
}
