import {
  HeatingControllerNodeOptions,
  HeatingControllerNodeOptionsDefaults,
  RoomMpcInput,
  RoomMpcParams,
  RoomMpcState,
} from "./types";

export type RoomMpcResult = {
  trvTargets: Record<string, number>;
  roomTemperature: number;
  demandPct: number;
};

type SensorEntry = {
  value: number;
  timestamp: number;
};

export class RoomMpcController {
  static readonly DEMAND_STEP_PCT = 5;
  static readonly DEMAND_CANDIDATE_COUNT =
    Math.floor(100 / RoomMpcController.DEMAND_STEP_PCT) + 1;
  static readonly DEFAULT_TRV_KEY = "__default__";
  private trvTemperatures: Record<string, SensorEntry> = {};
  private additionalTemperatureSensor?: SensorEntry;
  private outdoorTemperature?: SensorEntry;
  private flowTemperature?: SensorEntry;

  private mpcState: RoomMpcState = {};

  setTrvTemperature(name: string, value: number): void {
    this.trvTemperatures[name] = { value, timestamp: Date.now() };
  }

  setAdditionalSensor(value: number): void {
    this.additionalTemperatureSensor = { value, timestamp: Date.now() };
  }

  setOutdoorTemperature(value: number): void {
    this.outdoorTemperature = { value, timestamp: Date.now() };
  }

  setFlowTemperature(value: number): void {
    this.flowTemperature = { value, timestamp: Date.now() };
  }

  reset(): void {
    this.trvTemperatures = {};
    this.additionalTemperatureSensor = undefined;
    this.outdoorTemperature = undefined;
    this.flowTemperature = undefined;
    this.mpcState = {};
  }

  estimateRoomTemperature(): number | null {
    if (this.additionalTemperatureSensor !== undefined) {
      return this.additionalTemperatureSensor.value;
    }

    const trvValues = Object.values(this.trvTemperatures).map((e) => e.value);
    // With multiple TRVs, averaging reduces individual sensor bias; a single TRV is used directly as-is.
    if (trvValues.length >= 2) {
      return trvValues.reduce((a, b) => a + b, 0) / trvValues.length;
    }

    if (trvValues.length === 1) {
      return trvValues[0];
    }

    return null;
  }

  private estimateReferenceTrvTemperatures(
    trvIds: string[],
    minTargetTemperature: number,
  ): Record<string, number> {
    const roomTemp = this.estimateRoomTemperature();
    const result: Record<string, number> = {};
    for (const trvId of trvIds) {
      result[trvId] =
        this.trvTemperatures[trvId]?.value ?? roomTemp ?? minTargetTemperature;
    }
    return result;
  }

  compute(
    baseTargetTemperature: number,
    config: HeatingControllerNodeOptions,
    trvIds: string[],
  ): RoomMpcResult | null {
    const roomTemperature = this.estimateRoomTemperature();
    if (roomTemperature === null) {
      return null;
    }

    const mpcInput = this.buildRoomMpcInput(
      baseTargetTemperature,
      roomTemperature,
    );
    const params = this.buildRoomMpcParams(config);
    const rawDemandPct = this.computeRoomMpcDemand(mpcInput, params);
    const demandPct = this.applyStabilization(
      rawDemandPct,
      mpcInput.nowTs,
      params,
    );

    this.mpcState.lastRawDemandPct = rawDemandPct;
    this.mpcState.lastStabilizedDemandPct = demandPct;
    this.mpcState.lastPercent = demandPct;
    this.mpcState.lastUpdateTs = mpcInput.nowTs;
    this.mpcState.lastBaseTargetTemperature = baseTargetTemperature;
    this.mpcState.lastRoomTemperature = roomTemperature;

    const { minTemp, maxTemp } = this.normalizeTemperatureBounds(config);
    const step = normalizeTemperatureStep(config.targetTemperatureStep);
    const trvTargets: Record<string, number> = {};

    if (trvIds.length === 0) {
      const mapped = this.mapRoomDemandToTrvTargetTemperature(
        demandPct,
        roomTemperature,
        1,
        minTemp,
        maxTemp,
      );
      trvTargets[RoomMpcController.DEFAULT_TRV_KEY] =
        this.roundTargetTemperature(mapped, step);
    } else {
      const referenceTrvTemps = this.estimateReferenceTrvTemperatures(
        trvIds,
        minTemp,
      );
      for (const trvId of trvIds) {
        const trvConfig = config.trvs.find((t) => t.name === trvId);
        const powerFactor = trvConfig?.powerFactor ?? 1;
        const refTemp = referenceTrvTemps[trvId] ?? roomTemperature;
        const mapped = this.mapRoomDemandToTrvTargetTemperature(
          demandPct,
          refTemp,
          powerFactor,
          minTemp,
          maxTemp,
        );
        trvTargets[trvId] = this.roundTargetTemperature(mapped, step);
      }
    }

    this.mpcState.lastTrvTargets = trvTargets;

    return { trvTargets, roomTemperature, demandPct };
  }

  private buildRoomMpcInput(
    baseTargetTemperature: number,
    roomTempC: number,
  ): RoomMpcInput {
    return {
      targetTempC: baseTargetTemperature,
      roomTempC,
      outdoorTempC: this.outdoorTemperature?.value,
      flowTempC: this.flowTemperature?.value,
      nowTs: Date.now(),
    };
  }

  private computeRoomMpcDemand(
    input: RoomMpcInput,
    params: RoomMpcParams,
  ): number {
    const candidates = Array.from(
      { length: RoomMpcController.DEMAND_CANDIDATE_COUNT },
      (_, i) => i * RoomMpcController.DEMAND_STEP_PCT,
    );
    let bestCandidate = 0;
    let bestCost = Infinity;

    for (const candidate of candidates) {
      const cost = this.evaluateRoomCandidate(input, candidate, params);
      if (cost < bestCost) {
        bestCost = cost;
        bestCandidate = candidate;
      }
    }

    this.mpcState.lastCost = bestCost;
    this.mpcState.lastFlowFactor = this.computeFlowFactor(
      input.flowTempC,
      params,
    );

    return bestCandidate;
  }

  private evaluateRoomCandidate(
    input: RoomMpcInput,
    demandPct: number,
    params: RoomMpcParams,
  ): number {
    let predictedTemp = input.roomTempC;
    let totalCost = 0;

    for (let step = 0; step < params.horizonSteps; step++) {
      predictedTemp = this.simulateRoomTemperature(
        predictedTemp,
        demandPct,
        input.outdoorTempC,
        input.flowTempC,
        params,
      );
      totalCost += Math.pow(input.targetTempC - predictedTemp, 2);
    }

    const lastPercent = this.mpcState.lastPercent ?? demandPct;
    totalCost += Math.abs(demandPct - lastPercent) * params.changePenalty;

    return totalCost;
  }

  private simulateRoomTemperature(
    currentTemp: number,
    demandPct: number,
    outdoorTempC: number | undefined,
    flowTempC: number | undefined,
    params: RoomMpcParams,
  ): number {
    const valveFraction = demandPct / 100;
    const flowFactor = this.computeFlowFactor(flowTempC, params);
    const heating =
      params.thermalGain * valveFraction * flowFactor * params.stepMinutes;

    let loss: number;
    if (outdoorTempC === undefined) {
      loss = params.lossCoeff * params.stepMinutes;
    } else {
      loss = Math.max(
        0,
        params.lossCoeff * (currentTemp - outdoorTempC) * params.stepMinutes,
      );
    }

    return currentTemp + heating - loss;
  }

  private computeFlowFactor(
    flowTempC: number | undefined,
    params: RoomMpcParams,
  ): number {
    if (flowTempC === undefined || params.referenceFlowTemperature <= 0) {
      return 1;
    }
    return Math.max(
      params.minFlowFactor,
      Math.min(
        params.maxFlowFactor,
        flowTempC / params.referenceFlowTemperature,
      ),
    );
  }

  private applyStabilization(
    rawDemandPct: number,
    nowTs: number,
    params: RoomMpcParams,
  ): number {
    const lastPercent = this.mpcState.lastPercent;
    const lastUpdateTs = this.mpcState.lastUpdateTs;

    if (lastPercent !== undefined && lastUpdateTs !== undefined) {
      const elapsedSec = (nowTs - lastUpdateTs) / 1000;
      if (elapsedSec < params.holdTimeSeconds) {
        return lastPercent;
      }
    }

    if (lastPercent !== undefined) {
      const diff = rawDemandPct - lastPercent;

      if (Math.abs(diff) < params.demandHysteresisPct) {
        return lastPercent;
      }

      if (Math.abs(diff) > params.maxDemandStepPct) {
        return lastPercent + Math.sign(diff) * params.maxDemandStepPct;
      }
    }

    return rawDemandPct;
  }

  private buildRoomMpcParams(
    config: HeatingControllerNodeOptions,
  ): RoomMpcParams {
    const D = HeatingControllerNodeOptionsDefaults;
    const minFlowFactor = Math.max(
      0.01,
      config.mpcMinFlowFactor ?? D.mpcMinFlowFactor,
    );
    return {
      stepMinutes: Math.max(0.1, config.mpcStepMinutes || D.mpcStepMinutes),
      horizonSteps: Math.max(
        1,
        Math.round(config.mpcHorizonSteps || D.mpcHorizonSteps),
      ),
      thermalGain: Math.max(0, config.mpcThermalGain ?? D.mpcThermalGain),
      lossCoeff: Math.max(0, config.mpcLossCoeff ?? D.mpcLossCoeff),
      changePenalty: Math.max(0, config.mpcChangePenalty ?? D.mpcChangePenalty),
      demandHysteresisPct: Math.max(
        0,
        config.mpcDemandHysteresisPct ?? D.mpcDemandHysteresisPct,
      ),
      holdTimeSeconds: Math.max(
        0,
        config.mpcHoldTimeSeconds ?? D.mpcHoldTimeSeconds,
      ),
      maxDemandStepPct: Math.max(
        1,
        config.mpcMaxDemandStepPct ?? D.mpcMaxDemandStepPct,
      ),
      referenceFlowTemperature: Math.max(
        0,
        config.mpcReferenceFlowTemperature ?? D.mpcReferenceFlowTemperature,
      ),
      minFlowFactor,
      maxFlowFactor: Math.max(
        minFlowFactor,
        config.mpcMaxFlowFactor ?? D.mpcMaxFlowFactor,
      ),
    };
  }

  private mapRoomDemandToTrvTargetTemperature(
    demandPct: number,
    referenceTrvTemp: number,
    powerFactor: number,
    minTemp: number,
    maxTemp: number,
  ): number {
    const effectiveMax =
      referenceTrvTemp + (maxTemp - referenceTrvTemp) * powerFactor;

    let mapped: number;
    if (demandPct === 0) {
      mapped = referenceTrvTemp - 1;
    } else {
      mapped =
        referenceTrvTemp +
        (effectiveMax - referenceTrvTemp) * (demandPct / 100);
    }

    return Math.max(minTemp, Math.min(maxTemp, mapped));
  }

  private roundTargetTemperature(temp: number, step: number): number {
    return Math.round(temp / step) * step;
  }

  private normalizeTemperatureBounds(config: HeatingControllerNodeOptions): {
    minTemp: number;
    maxTemp: number;
  } {
    const minTemp = config.minTargetTemperature ?? 5;
    const maxTemp = Math.max(minTemp + 1, config.maxTargetTemperature ?? 30);
    return { minTemp, maxTemp };
  }
}

export function normalizeTemperatureStep(step: number | undefined): number {
  return step !== undefined && step > 0 ? step : 1;
}
