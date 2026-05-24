import { clamp, roundToStep } from "../../../../../helpers/math.helper";
import { convertToMilliseconds } from "../../../../../helpers/time.helper";
import { RoomMPCModelLearner } from "./learner";
import { RoomMPCSensors } from "./sensors";
import {
  HeatingMPCControllerNodeOptions,
  PersistedLearningFactors,
  RoomModelLearningState,
  TrvIndex,
} from "./types";
import { HeatEmitterModel } from "./models/emitter";
import { ThermalCapacityModel } from "./models/capacity";
import { RoomLossModel } from "./models/loss";
import {
  RoomMpcComputeResult,
  RoomMpcErrorCode,
  RoomMpcInput,
  RoomMpcResult,
} from "./results";

const MPC_PREDICTION_HORIZON_SECONDS = 1800;

const MPC_SIMULATION_STEP_SECONDS = 150;

type DemandPredictionResult = {
  demandPct: number;

  predictedTemperatureC: number;

  predictionError: number;
};

export class RoomMPCController {
  private readonly sensors: RoomMPCSensors;

  private readonly lossModel: RoomLossModel;

  private readonly capacityModel: ThermalCapacityModel;

  private readonly emitterModel: HeatEmitterModel;

  private readonly learner: RoomMPCModelLearner;

  private readonly holdTimeMs: number;

  private targetDemandPct = 0;

  private lastOutputDemandPct = 0;

  private lastDemandUpdateTs = 0;

  constructor(private readonly config: HeatingMPCControllerNodeOptions) {
    this.sensors = new RoomMPCSensors(config);

    this.emitterModel = new HeatEmitterModel(config);

    this.lossModel = new RoomLossModel(config);

    this.capacityModel = new ThermalCapacityModel(config);

    this.learner = new RoomMPCModelLearner(this.lossModel, this.capacityModel);
    if (config.mpcLearningEnabledByDefault) {
      this.learner.enable();
    }

    this.holdTimeMs = convertToMilliseconds(
      config.mpcHoldTime,
      config.mpcHoldTimeUnit,
    );
  }

  public destroy(): void {
    this.learner.destroy();
  }

  public setTrvTemperature(index: TrvIndex, value: number | undefined): void {
    this.sensors.setTrvTemperature(index, value);
  }

  public setAdditionalSensor(value: number): void {
    this.sensors.setAdditionalTemperature(value);
  }

  public setOutdoorTemperature(value: number): void {
    this.sensors.setOutdoorTemperature(value);
  }

  public setFlowTemperature(value: number): void {
    this.sensors.setFlowTemperature(value);
  }

  public compute(targetTemperature: number): RoomMpcComputeResult {
    const inputResult = this.sensors.createInput(targetTemperature);

    if (!inputResult.valid) {
      return {
        valid: false,
        error: inputResult.error,
      };
    }

    const input = inputResult.input;

    const availableHeatingPowerW =
      this.emitterModel.calculateAvailableHeatingPowerW(
        input.roomTempC,
        input.flowTempC,
      );

    if (availableHeatingPowerW <= 0) {
      return {
        valid: false,
        error: {
          code: RoomMpcErrorCode.noHeatingPowerAvailable,
          message:
            "No heating power available at current room and flow temperatures",
        },
      };
    }

    const optimalDemand = this.findOptimalDemandPrediction(input);

    const stabilizedDemandPct = this.applyDemandRateLimiting(
      input,
      optimalDemand.demandPct,
    );

    const requestedHeatingPowerW = roundToStep(
      availableHeatingPowerW * (stabilizedDemandPct / 100),
      0.01,
    );

    const recommendedFlowTemperatureC =
      this.emitterModel.calculateRecommendedFlowTemperatureC(
        requestedHeatingPowerW,
        input.roomTempC,
      );

    const learningState = this.updateLearningTelemetry(
      input,
      requestedHeatingPowerW,
      optimalDemand.predictedTemperatureC,
    );

    return {
      valid: true,
      result: this.createResult(
        input,
        learningState,
        stabilizedDemandPct,
        requestedHeatingPowerW,
        availableHeatingPowerW,
        recommendedFlowTemperatureC,
      ),
    };
  }

  private findOptimalDemandPrediction(
    input: RoomMpcInput,
  ): DemandPredictionResult {
    let bestPrediction: DemandPredictionResult = {
      demandPct: 0,

      predictedTemperatureC: input.roomTempC,

      predictionError: Number.POSITIVE_INFINITY,
    };

    for (let demandPct = 0; demandPct <= 100; demandPct += 5) {
      const predictedTemperatureC = this.predictRoomTemperatureC(
        input,
        demandPct,
        MPC_PREDICTION_HORIZON_SECONDS,
      );

      const predictionError = Math.abs(
        input.targetTempC - predictedTemperatureC,
      );

      if (predictionError < bestPrediction.predictionError) {
        bestPrediction = {
          demandPct,
          predictedTemperatureC,
          predictionError,
        };
      }
    }

    return bestPrediction;
  }

  private predictRoomTemperatureC(
    input: RoomMpcInput,
    demandPct: number,
    durationSeconds: number,
  ): number {
    let simulatedRoomTemperatureC = input.roomTempC;

    const stepCount = Math.max(
      1,
      Math.ceil(durationSeconds / MPC_SIMULATION_STEP_SECONDS),
    );

    for (let step = 0; step < stepCount; step++) {
      const availableHeatingPowerW =
        this.emitterModel.calculateAvailableHeatingPowerW(
          simulatedRoomTemperatureC,
          input.flowTempC,
        );

      const heatingPowerW = availableHeatingPowerW * (demandPct / 100);

      const heatLossW = this.lossModel.calculateHeatLossW(
        simulatedRoomTemperatureC,
        input.outdoorTempC,
      );

      const netHeatingPowerW = heatingPowerW - heatLossW;

      const predictedDeltaC = this.capacityModel.predictTemperatureChangeC(
        netHeatingPowerW,
        MPC_SIMULATION_STEP_SECONDS,
      );

      simulatedRoomTemperatureC += predictedDeltaC;
      simulatedRoomTemperatureC = clamp(simulatedRoomTemperatureC, 0, 35);

      if (Math.abs(predictedDeltaC) < 0.001) {
        break;
      }
    }

    return simulatedRoomTemperatureC;
  }

  private applyDemandRateLimiting(
    input: RoomMpcInput,
    demandPct: number,
  ): number {
    this.targetDemandPct = clamp(
      demandPct,
      this.targetDemandPct - this.config.mpcMaxDemandStepPct,
      this.targetDemandPct + this.config.mpcMaxDemandStepPct,
    );

    if (
      Math.abs(this.targetDemandPct - this.lastOutputDemandPct) <
      this.config.mpcDemandHysteresisPct
    ) {
      return this.lastOutputDemandPct;
    }

    if (
      input.nowTs - this.lastDemandUpdateTs < this.holdTimeMs &&
      Math.abs(this.targetDemandPct - this.lastOutputDemandPct) <
        this.config.mpcHoldOverrideDemandPct
    ) {
      return this.lastOutputDemandPct;
    }

    this.lastOutputDemandPct = this.targetDemandPct;

    this.lastDemandUpdateTs = input.nowTs;

    return this.lastOutputDemandPct;
  }

  private updateLearningTelemetry(
    input: RoomMpcInput,
    requestedHeatingPowerW: number,
    predictedRoomTemperatureC: number,
  ) {
    this.learner.appendHistory(input, requestedHeatingPowerW);

    this.learner.setPrediction({
      timestamp: input.nowTs,

      predictedRoomTemperatureC,

      predictionHorizonSeconds: MPC_PREDICTION_HORIZON_SECONDS,
    });

    const learningState = this.learner.getLearningState();
    return learningState;
  }

  private createResult(
    input: RoomMpcInput,
    learningState: RoomModelLearningState,
    stabilizedDemandPct: number,
    requestedHeatingPowerW: number,
    availableHeatingPowerW: number,
    recommendedFlowTemperatureC: number | null,
  ): RoomMpcResult {
    return new RoomMpcResult(
      this.emitterModel.calculateTargetTemperatures(stabilizedDemandPct),
      input,
      stabilizedDemandPct,
      requestedHeatingPowerW,
      availableHeatingPowerW,
      recommendedFlowTemperatureC,
      learningState,
    );
  }

  public consumePersistedLearningFactors(): PersistedLearningFactors | null {
    return this.learner.consumePersistedLearningFactors();
  }

  public recalibrateLearningFactors(factors: PersistedLearningFactors): void {
    this.learner.recalibrate(factors);
  }

  public enableLearning(): void {
    this.learner.enable();
  }

  public disableLearning(): void {
    this.learner.disable();
  }

  public suppressLearningForInterval(durationMs: number): void {
    this.learner.suppressForInterval(durationMs);
  }
}
