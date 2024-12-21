import { Node } from "node-red";
import { BaseNodeDebounceData } from "../../flowctrl/base/types";
import MatchJoinNode from "../../flowctrl/match-join";
import { NodeType } from "../../types";
import {
  defaultHeatingControllerNodeConfig,
  HeatingControllerNodeConfig,
  HeatingControllerNodeType,
} from "./types";

export default class HeatingControllerNode extends MatchJoinNode<HeatingControllerNodeConfig> {
  static get type(): NodeType {
    return HeatingControllerNodeType;
  }

  constructor(
    node: Node,
    config: HeatingControllerNodeConfig,
    private activeConditions: Record<string, boolean> = {},
    private windowsStates: Record<string, boolean> = {},
    private blocked: boolean = false,
    private comfortTemperature: number = 22,
    private ecoTemperatureOffset: number = -2
  ) {
    config = { ...defaultHeatingControllerNodeConfig, ...config };
    super(node, config, {
      statusOutput: { output: 3, topic: "controller_status" },
      initializeDelay: config.statusDelay,
    });
  }

  protected initialize() {
    this.nodeStatus = !this.blocked;
  }

  protected onClose(): void {
    super.onClose();
    this.activeConditions = {};
    this.windowsStates = {};
  }

  protected debounceListener(data: BaseNodeDebounceData): void {
    const msg = data.received_msg;
    const topic = msg.topic;

    switch (topic) {
      case "activeCondition":
        this.activeConditions[msg.originalTopic] = msg.payload;
        //this.handleActiveCondition();
        break;
      case "comfortTemperature":
        this.comfortTemperature = msg.payload;
        //this.handleComfortTemperature();
        break;
      case "ecoTemperatureOffset":
        this.ecoTemperatureOffset = msg.payload;
        //this.handleEcoTemperatureOffset();
        break;
      case "windowOpen":
        this.windowsStates[msg.originalTopic] = msg.payload;
        //this.handleWindowOpen();
        break;
      case "manual_control":
        //this.handleManualControl(msg);
        break;
    }
  }
}
