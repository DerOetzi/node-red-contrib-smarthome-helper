import { Node, NodeStatusFill } from "node-red";
import { RED } from "../../../globals";
import { convertToMilliseconds } from "../../../helpers/time.helper";
import { BaseNodeDebounceData } from "../../flowctrl/base/types";
import MatchJoinNode from "../../flowctrl/match-join";
import { MatchJoinNodeData } from "../../flowctrl/match-join/types";
import { orOp } from "../../logical/op/operations";
import { NodeType } from "../../types";
import {
  LightCommand,
  LightControllerNodeMessage,
} from "../light-controller/types";
import {
  defaultMotionControllerNodeConfig,
  MotionControllerCommand,
  MotionControllerNodeConfig,
  MotionControllerNodeData,
  MotionControllerNodeMessage,
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
    private night: boolean = false,
    private lastAction: string = ""
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

  protected matched(data: MotionControllerNodeData): void {
    const msg = data.msg;
    const topic = msg.topic;

    switch (topic) {
      case "motion":
        this.motionStates[msg.originalTopic] = msg.payload as boolean;
        this.handleMotion();
        break;
      case "command":
        this.blocked = msg.command === MotionControllerCommand.block;
        this.handleCommand(msg);
        break;
      case "manual_control":
        this.handleManualControl(msg);
        break;
      case "darkness":
        this.darkness = msg.payload as boolean;
        this.handleMotion(true);
        break;
      case "night":
        this.night = msg.payload as boolean;
        break;
    }
  }

  private handleMotion(ignoreTimer: boolean = false): void {
    if (!this.blocked && (!this.timer || ignoreTimer)) {
      if (this.isOn()) {
        if (this.config.nightmodeEnabled && this.night) {
          this.sendAction(this.config.nightmodeCommand);
        } else {
          this.sendAction(this.config.onCommand);
        }

        this.startTimer();
      } else {
        this.clearTimer();
        this.sendAction(this.config.offCommand);
      }
    }

    this.nodeStatus = !this.blocked;
  }

  private sendAction(action: string): void {
    this.lastAction = action;
    this.debounce({ msg: { topic: "action", payload: action } });
  }

  protected updateStatusAfterDebounce(_: BaseNodeDebounceData): void {
    this.nodeStatus = !this.blocked;
  }

  private startTimer(): void {
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

  private isOn(): boolean {
    return this.isMotion() && this.isDarkness();
  }

  private isMotion(): boolean {
    return orOp(Object.values(this.motionStates));
  }

  private isDarkness(): boolean {
    return !this.config.onlyDarkness || this.darkness;
  }

  private handleManualControl(msg: MotionControllerNodeMessage): void {
    if (!this.blocked) {
      if (this.lastAction && msg.payload !== this.lastAction) {
        this.blocked = true;
        this.handleCommand(msg);
      }
    }
  }

  private handleCommand(msg: MotionControllerNodeMessage): void {
    this.nodeStatus = !this.blocked;

    if (this.blocked) {
      this.clearTimer();
    }

    if (msg?.action) {
      let action: string;
      switch (msg.action) {
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
      this.sendAction(action);
    } else {
      this.handleMotion();
    }
  }

  private clearTimer(): void {
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
