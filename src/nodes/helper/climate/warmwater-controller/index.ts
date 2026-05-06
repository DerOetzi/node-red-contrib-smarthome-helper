import { NodeAPI, Node, NodeStatusFill } from "node-red";
import MatchJoinNode from "../../../flowctrl/match-join";
import { NodeCategory } from "../../../types";
import { HelperClimateCategory } from "../types";
import {
  WarmWaterControllerNodeDef,
  WarmWaterControllerNodeOptions,
  WarmWaterControllerNodeOptionsDefaults,
} from "./types";
import { NodeMessageFlow } from "../../../flowctrl/base/types";
import { HeatingControllerTarget } from "../heating-controller/types";

export default class WarmWaterControllerNode extends MatchJoinNode<
  WarmWaterControllerNodeDef,
  WarmWaterControllerNodeOptions
> {
  protected static readonly _nodeCategory: NodeCategory = HelperClimateCategory;
  protected static readonly _nodeType: string = "warmwater-controller";

  private active: boolean;

  constructor(RED: NodeAPI, node: Node, config: WarmWaterControllerNodeDef) {
    super(RED, node, config, WarmWaterControllerNodeOptionsDefaults);
    this.active = this.config.defaultActive;
  }

  protected matched(messageFlow: NodeMessageFlow): void {
    const topic = messageFlow.topic as HeatingControllerTarget;

    switch (topic) {
      case HeatingControllerTarget.activeCondition:
        this.active = messageFlow.payloadAsBoolean(true);
        break;
    }
  }

  protected statusColor(status: any): NodeStatusFill {
    let color: NodeStatusFill = "green";

    if (!this.active) {
      color = "red";
    } else if (status === null) {
      color = "grey";
    }

    return color;
  }

  protected statusTextFormatter(status: any): string {
    let text = "";

    if (!this.active) {
      return this.RED._("helper.warmwater-controller.status.inactive");
    }

    if (status === null) {
      text = "Unknown";
    }

    return text;
  }
}
