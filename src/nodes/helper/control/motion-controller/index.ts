import { Node, NodeAPI, NodeStatusFill } from "node-red";
import { convertToMilliseconds } from "../../../../helpers/time.helper";
import Migration from "../../../flowctrl/base/migration";
import { NodeMessageFlow } from "../../../flowctrl/base/types";
import { LogicalOperation } from "../../../logical/op";
import { NodeCategory } from "../../../types";
import { LightCommand } from "../../light/light-controller/types";
import { HelperControlCategory } from "../types";
import MotionControllerMigration from "./migration";
import {
  MotionControllerNodeDef,
  MotionControllerNodeOptions,
  MotionControllerNodeOptionsDefaults,
  MotionControllerTarget,
} from "./types";
import ActiveControllerNode from "../../../flowctrl/active-controller";
import { ActiveControllerTarget } from "../../../flowctrl/active-controller/types";

export default class MotionControllerNode extends ActiveControllerNode<
  MotionControllerNodeDef,
  MotionControllerNodeOptions
> {
  protected static readonly _nodeCategory: NodeCategory = HelperControlCategory;
  protected static readonly _nodeType: string = "motion-controller";
  protected static readonly _migration: Migration<any> =
    new MotionControllerMigration();

  private timer: NodeJS.Timeout | null = null;

  private motionStates: Record<string, boolean> = {};
  private darkness: boolean = true;
  private night: boolean = false;

  constructor(RED: NodeAPI, node: Node, config: MotionControllerNodeDef) {
    super(RED, node, config, MotionControllerNodeOptionsDefaults);
  }

  protected onClose(): void {
    super.onClose();
    this.clearTimer();
    this.motionStates = {};
  }

  protected matched(messageFlow: NodeMessageFlow): void {
    const topic = messageFlow.topic;

    switch (topic) {
      case MotionControllerTarget.motion:
        this.motionStates[messageFlow.originalTopic ?? "motion"] =
          messageFlow.payload as boolean;
        this.handleMotion();
        break;
      case ActiveControllerTarget.activeCondition:
        this.handleActivateTarget(messageFlow);
        break;
      case ActiveControllerTarget.command:
        this.handleCommandTarget(messageFlow);
        break;
      case ActiveControllerTarget.manualControl:
        this.handleManualControlTarget(messageFlow);
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

  protected onReactivate(): void {
    this.handleMotion(true);
  }

  protected onManualControl(manual: unknown): void {
    this.handleAction(manual);
  }

  protected onCommand(messageFlow: NodeMessageFlow): void {
    if (this.blocked) {
      this.clearTimer();
    }
    const msg = messageFlow.originalMsg;
    this.handleAction(msg?.action);
  }

  private handleAction(actionIn?: unknown): void {
    if (actionIn) {
      let action: string = actionIn as string;
      switch (actionIn) {
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

  private handleMotion(ignoreTimer: boolean = false): void {
    if (this.blocked || !this.active || (this.timer && !ignoreTimer)) {
      return;
    }

    if (this.isOn()) {
      if (this.config.nightmodeEnabled && this.night) {
        this.sendAction(this.config.nightmodeCommand!);
      } else {
        this.sendAction(this.config.onCommand!);
      }
      this.restartTimer();
    } else {
      this.switchOff();
    }

    this.triggerNodeStatus();
  }

  private restartTimer(): void {
    this.clearTimer();

    this.timer = setTimeout(
      () => {
        this.timer = null;

        if (this.isOn()) {
          this.restartTimer();
        } else {
          this.switchOff();
        }
      },
      convertToMilliseconds(this.config.timer, this.config.timerUnit),
    );
  }

  private isOn(): boolean {
    return this.isMotion() && this.isDarkness();
  }

  private isMotion(): boolean {
    if (!this.motionStates || Object.keys(this.motionStates).length === 0) {
      return false;
    }

    return LogicalOperation.or(Object.values(this.motionStates));
  }

  private isDarkness(): boolean {
    return !this.config.onlyDarkness || this.darkness;
  }

  private switchOff(): void {
    this.clearTimer();
    this.sendAction(this.config.offCommand!);
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private sendAction(action: string): void {
    if (!this.active) {
      return;
    }

    this.lastsend = action;

    const actionMessageFlow = new NodeMessageFlow(
      {
        topic: "action",
        payload: action,
      },
      0,
    );
    this.debounce(actionMessageFlow);
  }

  protected updateStatusAfterDebounce(_: NodeMessageFlow): void {
    this.triggerNodeStatus();
  }

  protected statusColor(status: any): NodeStatusFill {
    let color: NodeStatusFill = "yellow";

    if (!this.active) {
      color = "red";
    } else if (status === null) {
      color = "grey";
    } else if (this.blocked) {
      color = "red";
    } else if (this.timer) {
      color = "green";
    }

    return color;
  }

  protected statusTextFormatter(status: any): string {
    if (!this.active) {
      return this.RED._("helper.motion-controller.state.inactive");
    }

    let text = "";

    if (status === null) {
      text = "Unknown";
    } else if (this.blocked) {
      text = this.RED._("helper.motion-controller.state.automationOff");
    } else if (this.timer) {
      text = this.RED._("helper.motion-controller.state.active");
    } else {
      text = this.RED._("helper.motion-controller.state.automationOn");
    }

    if (this.isMotion()) {
      text += " - " + this.RED._("helper.motion-controller.state.motion");
    } else {
      text += " - " + this.RED._("helper.motion-controller.state.noMotion");
    }

    return text;
  }
}
