import { clamp, roundToStep } from "../../../../../../helpers/math.helper";

import {
  DesignTemperatureSystem,
  HeatEmitterType,
  HeatingMPCControllerNodeOptions,
  PanelRadiatorType,
  TrvRow,
} from "../types";

const RADIATOR_EXPONENTS: Record<PanelRadiatorType, number> = {
  "10": 1.2,
  "11": 1.25,
  "21": 1.3,
  "22": 1.35,
  "33": 1.4,
};

const PANEL_RADIATOR_REFERENCE_POWER_W_PER_METER: Record<
  number,
  Record<PanelRadiatorType, number>
> = {
  300: {
    "10": 450,
    "11": 600,
    "21": 900,
    "22": 1200,
    "33": 1800,
  },

  600: {
    "10": 800,
    "11": 1100,
    "21": 1600,
    "22": 2000,
    "33": 3000,
  },

  900: {
    "10": 1200,
    "11": 1600,
    "21": 2400,
    "22": 3100,
    "33": 4500,
  },
};

const MIN_ACTIVE_TRV_TEMPERATURE_C = 18;

type DesignTemperatures = {
  flowTemperatureC: number;
  overtemperatureC: number;
  spreadC: number;
};

const DesignSystemTemperatures: Record<
  DesignTemperatureSystem,
  DesignTemperatures
> = {
  [DesignTemperatureSystem.system_75_65]: {
    flowTemperatureC: 75,
    overtemperatureC: 50,
    spreadC: 10,
  },

  [DesignTemperatureSystem.system_70_55]: {
    flowTemperatureC: 70,
    overtemperatureC: 42.5,
    spreadC: 15,
  },

  [DesignTemperatureSystem.system_55_45]: {
    flowTemperatureC: 55,
    overtemperatureC: 30,
    spreadC: 10,
  },

  [DesignTemperatureSystem.system_45_35]: {
    flowTemperatureC: 45,
    overtemperatureC: 20,
    spreadC: 10,
  },

  [DesignTemperatureSystem.system_35_30]: {
    flowTemperatureC: 35,
    overtemperatureC: 12.5,
    spreadC: 5,
  },
};

const DISTRIBUTION_ALPHA = 0.7;

type PreparedEmitter = {
  trv: TrvRow;

  designReferencePowerW: number;

  distributionWeight: number;

  exponent: number;
};

export class HeatEmitterModel {
  private readonly emitters: PreparedEmitter[];
  private readonly designTemperatures: DesignTemperatures;

  constructor(config: HeatingMPCControllerNodeOptions) {
    this.designTemperatures =
      DesignSystemTemperatures[config.designTemperatureSystem];

    this.emitters = this.calculateDistributionWeights(
      config.trvs.map((trv) => this.createPreparedEmitter(trv)),
    );
  }

  private createPreparedEmitter(trv: TrvRow): PreparedEmitter {
    const exponent = this.getEmitterExponent(trv);

    const tableReferencePowerW = this.calculateEmitterTableReferencePowerW(trv);

    const designReferencePowerW = this.convertReferencePowerToDesignSystem(
      tableReferencePowerW,
      exponent,
    );

    return {
      trv,

      designReferencePowerW,

      distributionWeight: 0,

      exponent,
    };
  }

  private getEmitterExponent(trv: TrvRow): number {
    switch (trv.emitterType) {
      case HeatEmitterType.panel:
        return RADIATOR_EXPONENTS[trv.radiatorType ?? PanelRadiatorType.type22];
      case HeatEmitterType.towel:
      default:
        return 1.3;
    }
  }

  private calculateEmitterTableReferencePowerW(trv: TrvRow): number {
    switch (trv.emitterType) {
      case HeatEmitterType.panel:
        return this.calculatePanelRadiatorTableReferencePowerW(trv);

      case HeatEmitterType.towel:
        return trv.nominalPowerW ?? 0;

      default:
        return 0;
    }
  }

  private calculatePanelRadiatorTableReferencePowerW(radiator: TrvRow): number {
    if (
      radiator.heightMm === undefined ||
      radiator.widthMm === undefined ||
      radiator.radiatorType === undefined
    ) {
      return 0;
    }

    const interpolatedPowerPerMeter =
      this.interpolatePanelRadiatorPowerPerMeter(
        radiator.heightMm,
        radiator.radiatorType,
      );

    return roundToStep(
      interpolatedPowerPerMeter * (radiator.widthMm / 1000),
      0.01,
    );
  }

  private interpolatePanelRadiatorPowerPerMeter(
    heightMm: number,
    radiatorType: PanelRadiatorType,
  ): number {
    const availableHeights = Object.keys(
      PANEL_RADIATOR_REFERENCE_POWER_W_PER_METER,
    )
      .map(Number)
      .sort((a, b) => a - b);

    if (availableHeights.length === 0) {
      return 0;
    }

    if (availableHeights.includes(heightMm)) {
      return (
        PANEL_RADIATOR_REFERENCE_POWER_W_PER_METER[heightMm]?.[radiatorType] ??
        0
      );
    }

    if (heightMm <= availableHeights[0]) {
      return (
        PANEL_RADIATOR_REFERENCE_POWER_W_PER_METER[availableHeights[0]]?.[
          radiatorType
        ] ?? 0
      );
    }

    const lastIndex = availableHeights.length - 1;

    if (heightMm >= availableHeights[lastIndex]) {
      return (
        PANEL_RADIATOR_REFERENCE_POWER_W_PER_METER[
          availableHeights[lastIndex]
        ]?.[radiatorType] ?? 0
      );
    }

    let lowerHeight = availableHeights[0];
    let upperHeight = availableHeights[lastIndex];

    for (let i = 0; i < lastIndex; i++) {
      const currentHeight = availableHeights[i];

      const nextHeight = availableHeights[i + 1];

      if (heightMm > currentHeight && heightMm < nextHeight) {
        lowerHeight = currentHeight;
        upperHeight = nextHeight;
        break;
      }
    }

    const lowerPower =
      PANEL_RADIATOR_REFERENCE_POWER_W_PER_METER[lowerHeight]?.[radiatorType] ??
      0;

    const upperPower =
      PANEL_RADIATOR_REFERENCE_POWER_W_PER_METER[upperHeight]?.[radiatorType] ??
      0;

    if (lowerHeight === upperHeight) {
      return lowerPower;
    }

    const interpolationFactor =
      (heightMm - lowerHeight) / (upperHeight - lowerHeight);

    return lowerPower + (upperPower - lowerPower) * interpolationFactor;
  }

  private convertReferencePowerToDesignSystem(
    tableReferencePowerW: number,
    exponent: number,
  ): number {
    if (
      tableReferencePowerW <= 0 ||
      this.designTemperatures.overtemperatureC <= 0
    ) {
      return 0;
    }

    return (
      tableReferencePowerW *
      Math.pow(
        this.designTemperatures.overtemperatureC /
          DesignSystemTemperatures[DesignTemperatureSystem.system_75_65]
            .overtemperatureC,
        exponent,
      )
    );
  }

  private calculateDistributionWeights(
    emitters: PreparedEmitter[],
  ): PreparedEmitter[] {
    const totalReferencePower = emitters.reduce(
      (sum, emitter) => sum + emitter.designReferencePowerW,
      0,
    );

    if (totalReferencePower <= 0) {
      return emitters.map((emitter) => ({
        ...emitter,
        distributionWeight: 0,
      }));
    }

    const weightedDistribution = emitters.map((emitter) =>
      Math.pow(
        emitter.designReferencePowerW / totalReferencePower,
        DISTRIBUTION_ALPHA,
      ),
    );

    const weightedSum = weightedDistribution.reduce(
      (sum, value) => sum + value,
      0,
    );

    return emitters.map((emitter, index) => ({
      ...emitter,

      distributionWeight: weightedDistribution[index] / weightedSum,
    }));
  }

  public calculateAvailableHeatingPowerW(
    roomTemperatureC: number,
    flowTemperatureC?: number,
  ): number {
    return roundToStep(
      this.emitters.reduce((sum, emitter) => {
        const effectiveFlowTemperatureC =
          flowTemperatureC ?? this.designTemperatures.flowTemperatureC;

        const returnTemperatureC =
          effectiveFlowTemperatureC - this.designTemperatures.spreadC;

        const currentMeanTemperatureC =
          (effectiveFlowTemperatureC + returnTemperatureC) / 2;

        const currentOvertemperatureC =
          currentMeanTemperatureC - roomTemperatureC;

        if (currentOvertemperatureC <= 0) {
          return sum;
        }

        const currentPowerW =
          emitter.designReferencePowerW *
          Math.pow(
            currentOvertemperatureC / this.designTemperatures.overtemperatureC,
            emitter.exponent,
          );

        return sum + currentPowerW;
      }, 0),
      0.01,
    );
  }

  public calculateTargetTemperatures(demandPct: number): number[] {
    const demand = demandPct / 100;

    return this.emitters.map((emitter) =>
      this.calculateTargetTemperature(emitter, demand),
    );
  }

  private calculateTargetTemperature(
    emitter: PreparedEmitter,
    demand: number,
  ): number {
    if (demand < 0.05) {
      return emitter.trv.minTargetTemperature;
    }

    const weightedDemand = clamp(demand * emitter.distributionWeight, 0, 1);

    const effectiveDemand = Math.pow(weightedDemand, 1 / emitter.exponent);

    const minActiveTargetTemperature = Math.max(
      MIN_ACTIVE_TRV_TEMPERATURE_C,
      emitter.trv.minTargetTemperature,
    );

    const targetTemperature =
      minActiveTargetTemperature +
      effectiveDemand *
        (emitter.trv.maxTargetTemperature - minActiveTargetTemperature);

    return clamp(
      roundToStep(targetTemperature, emitter.trv.targetTemperatureStep),
      emitter.trv.minTargetTemperature,
      emitter.trv.maxTargetTemperature,
    );
  }

  public calculateRecommendedFlowTemperatureC(
    requiredHeatingPowerW: number,
    targetRoomTemperatureC: number,
  ): number | null {
    if (requiredHeatingPowerW <= 0) {
      return 0;
    }

    let low = 20;
    let high = 75;
    let optimalFlow = high;

    if (
      this.calculateAvailableHeatingPowerW(targetRoomTemperatureC, high) <
      requiredHeatingPowerW
    ) {
      return high;
    }

    while (high - low > 0.1) {
      const mid = (low + high) / 2;
      const availablePowerW = this.calculateAvailableHeatingPowerW(
        targetRoomTemperatureC,
        mid,
      );

      if (availablePowerW >= requiredHeatingPowerW) {
        optimalFlow = mid;
        high = mid;
      } else {
        low = mid;
      }
    }

    return Math.ceil(optimalFlow / 0.5) * 0.5;
  }
}
