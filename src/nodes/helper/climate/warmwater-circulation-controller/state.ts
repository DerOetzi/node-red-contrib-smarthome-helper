import { NodeMessageFlow } from "../../../flowctrl/base/types";
import { LogicalOperation } from "../../../logical/op";

export class WarmwaterCirculationStateController {
  private heatingAvailable = false;
  private runConditions: Record<string, boolean> = {};
  private specialReleases: Record<string, boolean> = {};

  public reset(): void {
    this.heatingAvailable = false;
    this.runConditions = {};
    this.specialReleases = {};
  }

  public setHeatingAvailable(value: boolean): void {
    this.heatingAvailable = value;
  }

  public setRunCondition(messageFlow: NodeMessageFlow): void {
    this.runConditions[messageFlow.originalTopic ?? "runCondition"] =
      messageFlow.payloadAsBoolean(false);
  }

  public setSpecialRelease(messageFlow: NodeMessageFlow): void {
    this.specialReleases[messageFlow.originalTopic ?? "specialRelease"] =
      messageFlow.payloadAsBoolean(false);
  }

  public get isHeatingAvailable(): boolean {
    return this.heatingAvailable;
  }

  public get isRunAllowed(): boolean {
    const values = Object.values(this.runConditions);
    return values.length === 0 || LogicalOperation.and(values);
  }

  public get isSpecialReleaseActive(): boolean {
    return LogicalOperation.or(Object.values(this.specialReleases));
  }
}
