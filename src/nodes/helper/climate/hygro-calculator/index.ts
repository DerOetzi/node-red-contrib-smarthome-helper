import { Node, NodeAPI } from "node-red";
import MatchJoinNode from "../../../flowctrl/match-join";
import { NodeCategory } from "../../../types";
import { HelperClimateCategory } from "../types";
import {
  HygroCalculatorNodeDef,
  HygroCalculatorNodeOptions,
  HygroCalculatorNodeOptionsDefaults,
} from "./types";
import { NodeMessageFlow } from "nodes/flowctrl/base/types";

export default class HygroCalculatorNode extends MatchJoinNode<
  HygroCalculatorNodeDef,
  HygroCalculatorNodeOptions
> {
  protected static readonly _nodeCategory: NodeCategory = HelperClimateCategory;
  protected static readonly _nodeType: string = "hygro-calculator";

  private temperature?: number;
  private humidity?: number;

  private absoluteHumidity?: number;

  constructor(RED: NodeAPI, node: Node, config: HygroCalculatorNodeDef) {
    super(RED, node, config, HygroCalculatorNodeOptionsDefaults);
  }

  protected matched(messageFlow: NodeMessageFlow): void {
    const topic = messageFlow.topic;
    const payload = messageFlow.payload as number;

    switch (topic) {
      case "temperature":
        this.temperature = payload;
        break;
      case "humidity":
        this.humidity = payload;
        break;
    }

    if (this.temperature !== undefined && this.humidity !== undefined) {
      const absHumidity = HygroCalculatorNode.calculateAbsoluteHumidity(
        this.temperature,
        this.humidity
      );
    }
  }

  public static calculateAbsoluteHumidity(
    temperature: number,
    relativeHumidity: number
  ): number {
    const vaporPressure = this.calculateVaporPressure(
      temperature,
      relativeHumidity
    );
    return (216.7 * vaporPressure) / (temperature + 273.15);
  }

  public static calculateVaporPressure(
    temperature: number,
    relativeHumidity: number
  ): number {
    const svp = this.calculateSaturationVaporPressure(temperature);
    return (relativeHumidity / 100) * svp;
  }

  public static calculateSaturationVaporPressure(temperature: number): number {
    const alpha = temperature >= 0 ? 7.5 : 9.5;
    const beta = temperature >= 0 ? 237.3 : 265.5;
    return 6.1078 * Math.pow(10, (alpha * temperature) / (beta + temperature));
  }
}
