import { LogicalOperation } from "../../../logical/op";
import { HeatMode, HeatingControllerNodeOptions } from "./types";

const DEFAULT_COMFORT_TEMPERATURE = 22;
const DEFAULT_ECO_TEMPERATURE_OFFSET = -2;

export class HeatingStateController {
  private comfortConditions: Record<string, boolean> = {};
  private windowsStates: Record<string, boolean> = {};

  private comfortTemperature = DEFAULT_COMFORT_TEMPERATURE;
  private ecoTemperatureOffset = DEFAULT_ECO_TEMPERATURE_OFFSET;
  private pvBoost = false;

  private heatingAvailable = true;
  private windowOpenState = false;
  private activeHeatmode = "";

  constructor(private readonly config: HeatingControllerNodeOptions) {
    this.reset();
  }

  public reset(): void {
    this.activeHeatmode = this.config.defaultComfort
      ? this.config.comfortCommand
      : this.config.ecoCommand;
    this.comfortConditions = { __default__: this.config.defaultComfort };
    this.windowsStates = {};
    this.windowOpenState = false;
    this.heatingAvailable = true;
    this.comfortTemperature = DEFAULT_COMFORT_TEMPERATURE;
    this.ecoTemperatureOffset = DEFAULT_ECO_TEMPERATURE_OFFSET;
    this.pvBoost = false;
  }

  public setComfortCondition(topic: string | undefined, value: boolean): void {
    if ("__default__" in this.comfortConditions) {
      delete this.comfortConditions["__default__"];
    }
    this.comfortConditions[topic ?? "comfort"] = value;
  }

  public setComfortTemperature(value: number): void {
    this.comfortTemperature = value;
  }

  public setEcoTemperatureOffset(value: number): void {
    this.ecoTemperatureOffset = value;
  }

  public setPvBoost(value: boolean): void {
    this.pvBoost = value;
  }

  public setHeatingAvailable(value: boolean): void {
    this.heatingAvailable = value;
  }

  public setActiveHeatmode(heatmode: string): void {
    if (heatmode) {
      this.activeHeatmode = heatmode;
    }
  }

  public updateWindowState(
    topic: string | undefined,
    isOpen: boolean,
  ): { previous: boolean; current: boolean } {
    const previous = this.windowOpenState;
    this.windowsStates[topic ?? "window"] = isOpen;
    this.windowOpenState = LogicalOperation.or(
      Object.values(this.windowsStates),
    );
    return { previous, current: this.windowOpenState };
  }

  public mapHeatmodeCommand(requestedHeatmode: string): string {
    switch (requestedHeatmode) {
      case HeatMode.comfort:
        return this.config.comfortCommand;
      case HeatMode.eco:
        return this.config.ecoCommand;
      case HeatMode.boost:
        return this.config.boostCommand;
      case HeatMode.frostProtection:
        return this.config.frostProtectionCommand;
      default:
        return requestedHeatmode;
    }
  }

  public isComfort(): boolean {
    return LogicalOperation.and(Object.values(this.comfortConditions));
  }

  public desiredAutomaticHeatmode(active: boolean, blocked: boolean): string {
    if (!this.automaticModeSelectionAllowed(active, blocked)) {
      return this.activeHeatmode;
    }
    return this.isComfort()
      ? this.config.comfortCommand
      : this.config.ecoCommand;
  }

  public automaticModeSelectionAllowed(
    active: boolean,
    blocked: boolean,
  ): boolean {
    return active && !blocked && !this.windowOpenState;
  }

  public shouldForceFrostProtection(): boolean {
    return this.windowOpenState || !this.heatingAvailable;
  }

  public resolveDisplayMode(): string {
    if (this.shouldForceFrostProtection()) {
      return this.config.frostProtectionCommand;
    }
    return this.activeHeatmode;
  }

  public determineBaseTargetTemperature(heatmode?: string): number | null {
    const mode = heatmode ?? this.activeHeatmode;
    switch (mode) {
      case this.config.comfortCommand:
        return this.comfortTemperature;
      case this.config.ecoCommand:
        return this.comfortTemperature + this.ecoTemperatureOffset;
      case this.config.boostCommand:
        return this.comfortTemperature + this.config.boostTemperatureOffset;
      case this.config.frostProtectionCommand:
        return this.config.frostProtectionTemperature;
      default:
        return null;
    }
  }

  public effectiveTargetTemperature(baseTargetTemperature: number): number {
    if (this.config.pvBoostEnabled && this.pvBoost) {
      return baseTargetTemperature + this.config.pvBoostTemperatureOffset;
    }
    return baseTargetTemperature;
  }

  public get isWindowOpen(): boolean {
    return this.windowOpenState;
  }

  public get isHeatingAvailable(): boolean {
    return this.heatingAvailable;
  }

  public get isPvBoostActive(): boolean {
    return this.pvBoost;
  }

  public get currentHeatmode(): string {
    return this.activeHeatmode;
  }
}
