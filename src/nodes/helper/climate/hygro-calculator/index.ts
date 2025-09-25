import { Node, NodeAPI } from "node-red";
import { NodeMessageFlow } from "../../../flowctrl/base/types";
import MatchJoinNode from "../../../flowctrl/match-join";
import { NodeCategory } from "../../../types";
import { HelperClimateCategory } from "../types";
import {
  HygroCalculatorNodeDef,
  HygroCalculatorNodeOptions,
  HygroCalculatorNodeOptionsDefaults,
} from "./types";

export default class HygroCalculatorNode extends MatchJoinNode<
  HygroCalculatorNodeDef,
  HygroCalculatorNodeOptions
> {
  protected static readonly _nodeCategory: NodeCategory = HelperClimateCategory;
  protected static readonly _nodeType: string = "hygro-calculator";

  private static readonly MAGNUS_FIT_PARAMETER = 6.1078;
  private static readonly ZERO_CELSIUS_IN_KELVIN = 273.15;
  private static readonly ALPHA_POSITIVE = 7.5;
  private static readonly BETA_POSITIVE = 237.3;
  private static readonly ALPHA_NEGATIVE = 9.5;
  private static readonly BETA_NEGATIVE = 265.5;

  private temperature?: number;
  private humidity?: number;

  private absoluteHumidity?: number;
  private dewPoint?: number;

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
      this.absoluteHumidity = HygroCalculatorNode.calculateAbsoluteHumidity(
        this.temperature,
        this.humidity
      );

      this.debounce(
        new NodeMessageFlow(
          { topic: "absoluteHumidity", payload: this.absoluteHumidity },
          0
        )
      );

      this.dewPoint = HygroCalculatorNode.calculateDewPoint(
        this.temperature,
        this.humidity
      );

      this.debounce(
        new NodeMessageFlow({ topic: "dewPoint", payload: this.dewPoint }, 1)
      );
    }
  }

  public static calculateDewPoint(
    temperature: number,
    humidity: number
  ): number {
    const vp = Math.max(
      HygroCalculatorNode.calculateVaporPressure(temperature, humidity),
      1e-12
    );
    const v = Math.log10(vp / HygroCalculatorNode.MAGNUS_FIT_PARAMETER);

    const tdWaterPos =
      (HygroCalculatorNode.BETA_POSITIVE * v) /
      (HygroCalculatorNode.ALPHA_POSITIVE - v);
    if (tdWaterPos >= 0) return tdWaterPos;

    return (
      (HygroCalculatorNode.BETA_NEGATIVE * v) /
      (HygroCalculatorNode.ALPHA_NEGATIVE - v)
    );
  }

  public static calculateAbsoluteHumidity(
    temperature: number,
    relativeHumidity: number
  ): number {
    const vaporPressure = this.calculateVaporPressure(
      temperature,
      relativeHumidity
    );
    return (216.7 * vaporPressure) / this.toKelvin(temperature);
  }

  public static calculateVaporPressure(
    temperature: number,
    relativeHumidity: number
  ): number {
    const svp =
      HygroCalculatorNode.calculateSaturationVaporPressure(temperature);
    return (relativeHumidity / 100) * svp;
  }

  public static calculateSaturationVaporPressure(temperature: number): number {
    return (
      HygroCalculatorNode.MAGNUS_FIT_PARAMETER *
      Math.pow(
        10,
        (HygroCalculatorNode.alpha(temperature) * temperature) /
          (HygroCalculatorNode.beta(temperature) + temperature)
      )
    );
  }

  private static alpha(temperature: number): number {
    return temperature >= 0
      ? HygroCalculatorNode.ALPHA_POSITIVE
      : HygroCalculatorNode.ALPHA_NEGATIVE;
  }

  private static beta(temperature: number): number {
    return temperature >= 0
      ? HygroCalculatorNode.BETA_POSITIVE
      : HygroCalculatorNode.BETA_NEGATIVE;
  }

  private static toKelvin(temperature: number): number {
    return temperature + HygroCalculatorNode.ZERO_CELSIUS_IN_KELVIN;
  }

  protected updateStatusAfterDebounce(messageFlow: NodeMessageFlow): void {
    if (messageFlow.output === 0) {
      this.nodeStatus = messageFlow.payload;
    }

    this.triggerNodeStatus();
  }

  protected statusTextFormatter(status: any): string {
    let text = "";

    if (status === undefined) {
      text = "Unknown";
    } else {
      text = `AH: ${status.toFixed(2)} g/m³`;
      if (this.dewPoint !== undefined) {
        text += `, DP: ${this.dewPoint.toFixed(2)} °C`;
      }
    }

    return text;
  }
}
