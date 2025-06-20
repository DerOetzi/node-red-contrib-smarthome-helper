import { Node, NodeAPI, NodeStatusFill } from "node-red";
import { convertToMilliseconds } from "../../../../helpers/time.helper";
import { NodeMessageFlow } from "../../../flowctrl/base/types";
import MatchJoinNode from "../../../flowctrl/match-join";
import { LogicalOperation } from "../../../logical/op";
import { NodeCategory } from "../../../types";
import { LightCommand } from "../../light/light-controller/types";
import { HelperControlCategory } from "../types";
import {
  MotionControllerCommand,
  MotionControllerNodeDef,
  MotionControllerNodeMessage,
  MotionControllerNodeOptions,
  MotionControllerNodeOptionsDefaults,
  MotionControllerTarget,
} from "./types";

export default class MotionControllerNode extends MatchJoinNode<
  MotionControllerNodeDef,
  MotionControllerNodeOptions
> {
  protected static readonly _nodeCategory: NodeCategory = HelperControlCategory;
  protected static readonly _nodeType: string = "motion-controller";

  private timer: NodeJS.Timeout | null = null;

  private motionStates: Record<string, boolean> = {};
  private darkness: boolean = true;
  private night: boolean = false;
  private lastAction: string = "";

  constructor(RED: NodeAPI, node: Node, config: MotionControllerNodeDef) {
    super(RED, node, config, MotionControllerNodeOptionsDefaults);
    this.initialize();
  }

  private initialize() {
    this.blocked = false;
  }

  private get blocked(): boolean {
    return !this.nodeStatus;
  }

  private set blocked(value: boolean) {
    this.nodeStatus = !value;
  }

  protected onClose(): void {
    super.onClose();
    this.motionStates = {};
  }

  protected matched(messageFlow: NodeMessageFlow): void {
    const topic = messageFlow.topic;

    const motionControllerMessage =
      messageFlow.originalMsg as MotionControllerNodeMessage;

    switch (topic) {
      case MotionControllerTarget.motion:
        this.motionStates[messageFlow.originalTopic ?? "motion"] =
          messageFlow.payload as boolean;
        this.handleMotion();
        break;
      case MotionControllerTarget.command:
        this.blocked =
          motionControllerMessage.command === MotionControllerCommand.block;
        this.handleCommand(motionControllerMessage);
        break;
      case MotionControllerTarget.manualControl:
        this.handleManualControl(motionControllerMessage);
        break;
      case MotionControllerTarget.darkness:
        this.darkness = messageFlow.payload as boolean;
        this.handleMotion(true);
        break;
      case MotionControllerTarget.night:
        this.night = messageFlow.payload as boolean;
        break;
    }
  }

  private handleMotion(ignoreTimer: boolean = false): void {
    if (!this.blocked && (!this.timer || ignoreTimer)) {
      if (this.isOn()) {
        if (this.config.nightmodeEnabled && this.night) {
          this.sendAction(this.config.nightmodeCommand!);
        } else {
          this.sendAction(this.config.onCommand!);
        }

        this.startTimer();
      } else {
        this.clearTimer();
        this.sendAction(this.config.offCommand!);
      }
    }

    this.triggerNodeStatus();
  }

  private sendAction(action: string): void {
    this.lastAction = action;
    const actionMessageFlow = new NodeMessageFlow(
      {
        topic: "action",
        payload: action,
      },
      0
    );
    this.debounce(actionMessageFlow);
  }

  protected updateStatusAfterDebounce(_: NodeMessageFlow): void {
    this.triggerNodeStatus();
  }

  private startTimer(): void {
    this.timer ??= setInterval(
      () => {
        if (!this.isOn()) {
          this.handleMotion(true);
        }
      },
      convertToMilliseconds(this.config.timer, this.config.timerUnit)
    );
  }

  private isOn(): boolean {
    return this.isMotion() && this.isDarkness();
  }

  private isMotion(): boolean {
    return LogicalOperation.or(Object.values(this.motionStates));
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
    this.triggerNodeStatus();

    if (this.blocked) {
      this.clearTimer();
    }

    if (msg?.action) {
      let action: string;
      switch (msg.action) {
        case LightCommand.On:
          action = this.config.onCommand!;
          break;
        case LightCommand.Nightmode:
          action = this.config.nightmodeCommand!;
          break;
        case LightCommand.Off:
          action = this.config.offCommand!;
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
      text = this.RED._("helper.motion-controller.status.automationOff");
    } else if (this.timer) {
      text = this.RED._("helper.motion-controller.status.active");
    } else {
      text = this.RED._("helper.motion-controller.status.automationOn");
    }

    if (this.isMotion()) {
      text += " - " + this.RED._("helper.motion-controller.status.motion");
    } else {
      text += " - " + this.RED._("helper.motion-controller.status.noMotion");
    }

    return text;
  }
}
