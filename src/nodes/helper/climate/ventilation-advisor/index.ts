import { Node, NodeAPI } from "node-red";
import { NodeMessageFlow } from "../../../flowctrl/base/types";
import MatchJoinNode from "../../../flowctrl/match-join";
import { NodeCategory } from "../../../types";
import { HelperClimateCategory } from "../types";

import { VentilationAdvisorRoomTypeMetadata } from "./constants";
import {
  VentilationAdvisorNodeDef,
  VentilationAdvisorNodeOptions,
  VentilationAdvisorNodeOptionsDefaults,
  VentilationAdvisorRoomTypeMeta,
  VentilationAdvisorState,
  VentilationAdvisorTarget,
} from "./types";

export class VentilationAdvisor extends MatchJoinNode<
  VentilationAdvisorNodeDef,
  VentilationAdvisorNodeOptions
> {
  protected static readonly _nodeCategory: NodeCategory = HelperClimateCategory;
  static readonly Type = "ventilation-advisor";

  private readonly state: VentilationAdvisorState = {};
  private readonly required: (keyof VentilationAdvisorState)[] = [
    "temperatureRoom",
    "humidityRoom",
    "temperatureOutdoor",
    "humidityOutdoor",
    "heating",
  ];

  private readonly roomTypeLimits: VentilationAdvisorRoomTypeMeta;

  constructor(RED: NodeAPI, node: Node, config: VentilationAdvisorNodeDef) {
    super(RED, node, config, VentilationAdvisorNodeOptionsDefaults);
    this.roomTypeLimits =
      VentilationAdvisorRoomTypeMetadata[this.config.roomType];
  }

  protected matched(flow: NodeMessageFlow): void {
    const topic = flow.topic as VentilationAdvisorTarget | string;

    switch (topic) {
      case VentilationAdvisorTarget.TemperatureRoom:
        this.state.temperatureRoom = flow.payloadAsNumber();
        break;
      case VentilationAdvisorTarget.HumidityRoom:
        this.state.humidityRoom = flow.payloadAsNumber();
        break;
      case VentilationAdvisorTarget.TemperatureOutdoor:
        this.state.temperatureOutdoor = flow.payloadAsNumber();
        break;
      case VentilationAdvisorTarget.HumidityOutdoor:
        this.state.humidityOutdoor = flow.payloadAsNumber();
        break;
      case VentilationAdvisorTarget.Heating:
        this.state.heating = flow.payloadAsBoolean();
        break;
      case VentilationAdvisorTarget.Co2Room:
        this.state.co2Room = flow.payloadAsNumber();
        break;
      case VentilationAdvisorTarget.VocRoomUgm3:
        this.state.vocRoomUgm3 = flow.payloadAsNumber();
        break;
      case VentilationAdvisorTarget.VocRoomPpb:
        this.state.vocRoomPpb = flow.payloadAsNumber();
        break;
      case VentilationAdvisorTarget.VocRoomIndex:
        this.state.vocRoomIndex = flow.payloadAsNumber();
        break;
    }

    if (!this.hasAllRequired()) {
      return;
    }
  }

  private hasAllRequired(): boolean {
    return this.required.every((k) => this.state[k] !== undefined);
  }
}

export default VentilationAdvisor;
