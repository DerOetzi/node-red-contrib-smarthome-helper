import { Node, NodeAPI } from "node-red";
import { NodeMessageFlow } from "../../../flowctrl/base/types";
import MatchJoinNode from "../../../flowctrl/match-join";
import { ArithmeticOperation } from "../../../operator/arithmetic";
import { NodeCategory } from "../../../types";
import { HelperClimateCategory } from "../types";
import {
  ALPHA_NEGATIVE,
  ALPHA_POSITIVE,
  BETA_NEGATIVE,
  BETA_POSITIVE,
  MAGNUS_FIT_PARAMETER,
  ZERO_CELSIUS_IN_KELVIN,
} from "./constants";
import {
  HygroCalculatorNodeDef,
  HygroCalculatorNodeOptions,
  HygroCalculatorNodeOptionsDefaults,
  HygroCalculatorTarget,
} from "./types";

export default class HygroCalculatorNode extends MatchJoinNode<
  HygroCalculatorNodeDef,
  HygroCalculatorNodeOptions
> {
  protected static readonly _nodeCategory: NodeCategory = HelperClimateCategory;
  protected static readonly _nodeType: string = "hygro-calculator";

  private temperature?: number;
  private humidity?: number;

  private absoluteHumidity?: number;
  private dewPoint?: number;

  constructor(RED: NodeAPI, node: Node, config: HygroCalculatorNodeDef) {
    super(RED, node, config, HygroCalculatorNodeOptionsDefaults);
  }

  protected matched(messageFlow: NodeMessageFlow): void {
    const topic = messageFlow.topic;
    const payload = messageFlow.payloadAsNumber();

    switch (topic) {
      case HygroCalculatorTarget.temperature:
        this.temperature = payload;
        break;
      case HygroCalculatorTarget.humidity:
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
          {
            topic: "absoluteHumidity",
            payload: ArithmeticOperation.round(this.absoluteHumidity, 1),
          },
          0
        )
      );

      this.dewPoint = HygroCalculatorNode.calculateDewPoint(
        this.temperature,
        this.humidity
      );

      this.debounce(
        new NodeMessageFlow(
          {
            topic: "dewPoint",
            payload: ArithmeticOperation.round(this.dewPoint, 1),
          },
          1
        )
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
    const v = Math.log10(vp / MAGNUS_FIT_PARAMETER);

    const tdWaterPos = (BETA_POSITIVE * v) / (ALPHA_POSITIVE - v);
    if (tdWaterPos >= 0) return tdWaterPos;

    return (BETA_NEGATIVE * v) / (ALPHA_NEGATIVE - v);
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
      MAGNUS_FIT_PARAMETER *
      Math.pow(
        10,
        (HygroCalculatorNode.alpha(temperature) * temperature) /
          (HygroCalculatorNode.beta(temperature) + temperature)
      )
    );
  }

  private static alpha(temperature: number): number {
    return temperature >= 0 ? ALPHA_POSITIVE : ALPHA_NEGATIVE;
  }

  private static beta(temperature: number): number {
    return temperature >= 0 ? BETA_POSITIVE : BETA_NEGATIVE;
  }

  private static toKelvin(temperature: number): number {
    return temperature + ZERO_CELSIUS_IN_KELVIN;
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
      text = `AH: ${status.toFixed(1)} g/m³`;
      if (this.dewPoint !== undefined) {
        text += `, DP: ${this.dewPoint.toFixed(1)} °C`;
      }
    }

    return text;
  }
}
