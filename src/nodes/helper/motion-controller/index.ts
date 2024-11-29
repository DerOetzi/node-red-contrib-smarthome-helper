import { Node, NodeStatusFill } from "node-red";
import { RED } from "../../../globals";
import { convertToMilliseconds } from "../../../helpers/time.helper";
import { BaseNodeDebounceData } from "../../flowctrl/base/types";
import MatchJoinNode from "../../flowctrl/match-join";
import { orOp } from "../../logical/op/operations";
import { NodeType } from "../../types";
import { LightCommand } from "../light-controller/types";
import {
  defaultMotionControllerNodeConfig,
  MotionControllerCommand,
  MotionControllerNodeConfig,
  MotionControllerNodeType,
} from "./types";

export default class MotionControllerNode extends MatchJoinNode<MotionControllerNodeConfig> {
  private timer: NodeJS.Timeout | null = null;

  static get type(): NodeType {
    return MotionControllerNodeType;
  }

  constructor(
    node: Node,
    config: MotionControllerNodeConfig,
    private motionStates: Record<string, boolean> = {},
    private blocked: boolean = false,
    private darkness: boolean = true,
    private night: boolean = false
  ) {
    config = { ...defaultMotionControllerNodeConfig, ...config };
    super(node, config, {
      statusOutput: { output: 1, topic: "controller_status" },
      initializeDelay: config.statusDelay,
    });
  }

  protected initialize() {
    this.nodeStatus = !this.blocked;
  }

  protected onClose(): void {
    super.onClose();
    this.motionStates = {};
  }

  protected debounceListener(data: BaseNodeDebounceData): void {
    const msg = data.received_msg;
    const topic = msg.topic;

    switch (topic) {
      case "motion":
        this.motionStates[msg.originalTopic] = msg.payload;
        this.handleMotion();
        break;
      case "command":
        this.blocked = msg.command === MotionControllerCommand.block;
        this.handleCommand(msg);
        break;
      case "darkness":
        this.darkness = msg.payload;
        this.handleMotion(true);
        break;
      case "night":
        this.night = msg.payload;
        break;
    }
  }

  private handleMotion(ignoreTimer: boolean = false): void {
    if (!this.blocked && (!this.timer || ignoreTimer)) {
      const msg = { topic: "action" };

      if (this.isOn()) {
        if (this.config.nightmodeEnabled && this.night) {
          this.sendMsg(msg, { payload: this.config.nightmodeCommand });
        } else {
          this.sendMsg(msg, { payload: this.config.onCommand });
        }

        this.startTimer();
      } else {
        this.clearTimer();
        this.sendMsg(msg, { payload: this.config.offCommand });
      }
    }

    this.nodeStatus = !this.blocked;
  }

  private startTimer() {
    if (!this.timer) {
      this.timer = setInterval(
        () => {
          if (!this.isOn()) {
            this.handleMotion(true);
          }
        },
        convertToMilliseconds(this.config.timer, this.config.timerUnit)
      );
    }
  }

  private isOn() {
    return this.isMotion() && this.isDarkness();
  }

  private isMotion() {
    return orOp(Object.values(this.motionStates));
  }

  private isDarkness() {
    return !this.config.onlyDarkness || this.darkness;
  }

  private handleCommand(msg: any): void {
    this.nodeStatus = !this.blocked;

    if (this.blocked) {
      this.clearTimer();
    }

    if (msg?.action) {
      let action = msg.action;
      switch (action) {
        case LightCommand.On:
          action = this.config.onCommand;
          break;
        case LightCommand.Nightmode:
          action = this.config.nightmodeCommand;
          break;
        case LightCommand.Off:
          action = this.config.offCommand;
          break;
      }
      this.sendMsg({ topic: "action" }, { payload: action });
    } else {
      this.handleMotion();
    }
  }

  private clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  protected statusColor(status: any): NodeStatusFill {
    let color: NodeStatusFill = "yellow";

    if (status === null) {
      color = "grey";
    } else if (this.blocked) {
      color = "red";
    } else if (this.timer) {
      color = "green";
    }

    return color;
  }

  protected statusTextFormatter(status: any): string {
    let text = "";
    if (status === null) {
      text = "Unknown";
    } else if (this.blocked) {
      text = RED._("helper.motion-controller.status.automationOff");
    } else if (this.timer) {
      text = RED._("helper.motion-controller.status.active");
    } else {
      text = RED._("helper.motion-controller.status.automationOn");
    }

    if (this.isMotion()) {
      text += " - " + RED._("helper.motion-controller.status.motion");
    } else {
      text += " - " + RED._("helper.motion-controller.status.noMotion");
    }

    return text;
  }
}
