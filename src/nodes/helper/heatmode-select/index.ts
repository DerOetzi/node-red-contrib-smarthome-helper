import { Node, NodeStatusFill } from "node-red";
import { convertToMilliseconds } from "../../../helpers/time.helper";
import { BaseNodeDebounceData } from "../../flowctrl/base/types";
import MatchJoinNode from "../../flowctrl/match-join";
import { NodeType } from "../../types";
import {
  defaultHeatModeSelectNodeConfig,
  HeatModeSelectNodeConfig,
  HeatModeSelectNodeType,
} from "./types";

export default class HeatModeSelectNode extends MatchJoinNode<HeatModeSelectNodeConfig> {
  constructor(node: Node, config: HeatModeSelectNodeConfig) {
    config = { ...defaultHeatModeSelectNodeConfig, ...config };
    super(node, config);
  }

  static get type(): NodeType {
    return HeatModeSelectNodeType;
  }

  protected debounceListener(data: BaseNodeDebounceData): void {
    const heatmode = data.result.heatmode;
    const comfortTemp = data.result.comfortTemp;
    const ecoTempOffset = data.result.ecoTempOffset;

    let targetTemperature = 0;
    let active = false;

    switch (heatmode) {
      case this.config.comfortMode:
        targetTemperature = comfortTemp;
        active = true;
        break;
      case this.config.ecoMode:
        targetTemperature = comfortTemp + ecoTempOffset;
        break;
      case this.config.boostMode:
        targetTemperature = comfortTemp + 5;
        active = true;
        break;
      case this.config.frostProtectionMode:
        targetTemperature = 8;
        break;
      default:
        this.node.error(`Unknown heatmode: ${heatmode}`);
        return;
    }

    const msg = data.received_msg;

    this.sendMsg(msg, {
      payload: { heatmode, targetTemperature, active },
      send: data.send,
      additionalAttributes: { input: data.result },
    });

    this.nodeStatus = { heatmode, targetTemperature, active };

    if (this.config.checkAutomationInProgress && msg.topic === "heatmode") {
      const inProgress = this.node
        .context()
        .flow.get(`automation_${this.config.automationProgressId}`);

      if (!inProgress) {
        this.sendMsgToOutput(
          {
            gate: "pause",
            pause: convertToMilliseconds(
              this.config.pauseTime,
              this.config.pauseTimeUnit
            ),
          },
          { send: data.send, output: 1 }
        );
      }

      this.node
        .context()
        .flow.set(`automation_${this.config.automationProgressId}`, false);
    }
  }

  protected statusColor(status: any): NodeStatusFill {
    let color: NodeStatusFill = "red";
    if (status === null || status === undefined || status === "") {
      color = "grey";
    } else if (status === "waiting") {
      color = "yellow";
    } else if (status.active) {
      color = "green";
    }

    return color;
  }

  protected statusTextFormatter(status: any): string {
    if (status === null || status === undefined || status === "") {
      return "unknown";
    } else if (status === "waiting") {
      return "waiting";
    } else {
      return `${status.heatmode} (${status.targetTemperature} °C)`;
    }
  }
}
