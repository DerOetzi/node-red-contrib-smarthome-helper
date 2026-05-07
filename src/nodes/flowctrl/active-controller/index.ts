import { Node, NodeAPI, NodeStatusFill } from "node-red";
import { convertToMilliseconds } from "../../../helpers/time.helper";
import { NodeMessageFlow } from "../base/types";
import MatchJoinNode from "../match-join";
import {
  ActiveControllerNodeDef,
  ActiveControllerNodeOptions,
  ActiveControllerNodeOptionsDefaults,
  ActiveControllerCommand,
  ActiveControllerNodeMessage,
} from "./types";

export default abstract class ActiveControllerNode<
  T extends ActiveControllerNodeDef = ActiveControllerNodeDef,
  U extends ActiveControllerNodeOptions = ActiveControllerNodeOptions,
> extends MatchJoinNode<T, U> {
  protected active: boolean;

  private _blocked: boolean = false;
  private reactivateTimer: NodeJS.Timeout | null = null;

  protected lastsend: string = "";

  constructor(
    RED: NodeAPI,
    node: Node,
    config: T,
    defaultConfig: U = ActiveControllerNodeOptionsDefaults as U,
  ) {
    super(RED, node, config, defaultConfig);
    this.active = this.config.defaultActive;
    this.blocked = false;
  }

  protected onClose(): void {
    super.onClose();
    this.clearReactivateTimer();
  }

  protected handleActivateTarget(messageFlow: NodeMessageFlow): void {
    this.active = messageFlow.payloadAsBoolean(true);
    if (this.active) {
      this.blocked = false;
      this.onReactivate();
    } else {
      this.triggerNodeStatus();
    }
  }

  protected get blocked(): boolean {
    return this._blocked;
  }

  protected set blocked(value: boolean) {
    this._blocked = value;
    this.nodeStatus = !value;
    if (value) {
      this.startReactivateTimer();
    } else {
      this.clearReactivateTimer();
    }
  }

  private startReactivateTimer(): void {
    if (this.config.reactivateEnabled && !this.reactivateTimer) {
      this.reactivateTimer = setTimeout(
        () => {
          this.clearReactivateTimer();
          this._blocked = false;
          this.nodeStatus = true;
          this.onReactivate();
        },
        convertToMilliseconds(this.config.pause, this.config.pauseUnit),
      );
    }
  }

  private clearReactivateTimer(): void {
    if (this.reactivateTimer) {
      clearTimeout(this.reactivateTimer);
      this.reactivateTimer = null;
    }
  }

  protected abstract onReactivate(): void;

  protected handleCommandTarget(messageFlow: NodeMessageFlow): void {
    const commandMsg = messageFlow.originalMsg as ActiveControllerNodeMessage;
    this.blocked = commandMsg.command === ActiveControllerCommand.block;
    if (!this.blocked) {
      this.onCommand(messageFlow);
    }
  }

  protected abstract onCommand(message: NodeMessageFlow): void;

  protected handleManualControlTarget(message: NodeMessageFlow): void {
    if (!this.blocked) {
      this.blocked = this.lastsend !== "" && message.payload !== this.lastsend;
    }

    this.onManualControl(message.payload);
  }

  protected abstract onManualControl(manual: any): void;

  protected statusColor(status: any): NodeStatusFill {
    if (!this.active) {
      return "red";
    }
    return super.statusColor(status);
  }
}
