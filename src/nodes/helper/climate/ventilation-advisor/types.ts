import { EditorNodePropertiesDef } from "node-red";
import { cloneDeep } from "../../../../helpers/object.helper";
import {
  BaseEditorNodePropertiesDefaults,
  BaseNodeOptionsDefaults,
  NodeMessageFlow,
} from "../../../flowctrl/base/types";
import {
  MatcherRowDefaults,
  MatchJoinEditorNodeProperties,
  MatchJoinNodeDef,
  MatchJoinNodeOptions,
} from "../../../flowctrl/match-join/types";
import { NodeSendFunction } from "../../../types";

export enum VentilationAdvisorTarget {
  TemperatureRoom = "TemperatureRoom",
  HumidityRoom = "HumidityRoom",
  TemperatureOutdoor = "TemperatureOutdoor",
  HumidityOutdoor = "HumidityOutdoor",
  Heating = "Heating",
  Co2Room = "Co2Room",
  VocRoomUgm3 = "VocRoomUgm3",
  VocRoomPpb = "VocRoomPpb",
  VocRoomIndex = "VocRoomIndex",
}

export enum VentilationAdvisorRoomType {
  Living = "Living",
  Bedroom = "Bedroom",
  Wet = "Wet",
  Cellar = "Cellar",
}

export interface VentilationAdvisorRoomTypeMeta {
  relativeHumidity: VentilationAdvisorLimit;
  dewPointDelta: VentilationAdvisorLimit;
  absoluteHumidityDifference: VentilationAdvisorDifferenceThreshold;
}

export interface VentilationAdvisorState {
  temperatureRoom?: number;
  humidityRoom?: number;
  temperatureOutdoor?: number;
  humidityOutdoor?: number;
  heating?: boolean;
  co2Room?: number;
  vocRoomUgm3?: number;
  vocRoomPpb?: number;
  vocRoomIndex?: number;
}

export interface VentilationAdvisorNodeOptions extends MatchJoinNodeOptions {
  roomType: VentilationAdvisorRoomType;
  comfortBrakeDelta: number;
}

export const VentilationAdvisorNodeOptionsDefaults: VentilationAdvisorNodeOptions =
  {
    ...BaseNodeOptionsDefaults,
    matchers: [
      {
        ...MatcherRowDefaults,
        target: VentilationAdvisorTarget.TemperatureRoom,
        targetType: "str",
      },
      {
        ...MatcherRowDefaults,
        target: VentilationAdvisorTarget.HumidityRoom,
        targetType: "str",
      },
      {
        ...MatcherRowDefaults,
        target: VentilationAdvisorTarget.TemperatureOutdoor,
        targetType: "str",
      },
      {
        ...MatcherRowDefaults,
        target: VentilationAdvisorTarget.HumidityOutdoor,
        targetType: "str",
      },
      {
        ...MatcherRowDefaults,
        target: VentilationAdvisorTarget.Heating,
        targetType: "str",
      },
    ],
    join: false,
    discardNotMatched: true,
    minMsgCount: 1,
    outputs: 3,
    roomType: VentilationAdvisorRoomType.Living,
    comfortBrakeDelta: 10,
  };

export interface VentilationAdvisorNodeDef
  extends MatchJoinNodeDef,
    VentilationAdvisorNodeOptions {}

export interface VentilationAdvisorEditorNodeProperties
  extends MatchJoinEditorNodeProperties,
    VentilationAdvisorNodeOptions {}

export const VentilationAdvisorEditorNodePropertiesDefaults: EditorNodePropertiesDef<VentilationAdvisorEditorNodeProperties> =
  {
    ...BaseEditorNodePropertiesDefaults,
    matchers: {
      value: VentilationAdvisorNodeOptionsDefaults.matchers,
      required: true,
    },
    discardNotMatched: {
      value: VentilationAdvisorNodeOptionsDefaults.discardNotMatched,
      required: true,
    },
    join: { value: VentilationAdvisorNodeOptionsDefaults.join, required: true },
    minMsgCount: {
      value: VentilationAdvisorNodeOptionsDefaults.minMsgCount,
      required: true,
    },
    outputs: {
      value: VentilationAdvisorNodeOptionsDefaults.outputs,
      required: true,
    },
    roomType: {
      value: VentilationAdvisorNodeOptionsDefaults.roomType,
      required: true,
    },
    comfortBrakeDelta: {
      value: VentilationAdvisorNodeOptionsDefaults.comfortBrakeDelta,
      required: true,
    },
  };

export enum VentilationAdvisorAdvice {
  Ventilate = "ventilate",
  NoVentilation = "no-ventilation",
  Neutral = "neutral",
}

export enum VentilationAdvisorIntensity {
  Short = "short",
  Medium = "medium",
  Long = "long",
}

export enum VentilationAdvisorReasonCode {
  AbsoluteHumidityDifferenceHigh = "absolute_humidity_difference_high",
  AbsoluteHumidityDifferenceLow = "absolute_humidity_difference_low",
  OutsideMoreHumid = "outside_more_humid",
  DeltaTemperatureDewPointLow = "delta_temperature_dew_point_low",
  RelativeHumidityHigh = "relative_humidity_high",
  Co2High = "co2_high",
  VocHigh = "voc_high",
  DataInvalid = "data_invalid",
  StaleData = "stale_data",
  ComfortBrakeApplied = "comfort_brake_applied",
}

/* --- Reusable limit interfaces --- */
export interface VentilationAdvisorLimit {
  warn: number;
  critical: number;
}

export interface VentilationAdvisorDifferenceThreshold {
  min: number;
  max: number;
}

/* --- Generic payload flow --- */
export class VentilationAdvisorPayloadMessageFlow<T> extends NodeMessageFlow {
  constructor(
    topic: string,
    payload: T,
    output: number,
    send?: NodeSendFunction
  ) {
    super({ topic }, output, send);
    this.payload = payload;
  }
  get value(): T {
    return this.payload as T;
  }
  set value(v: T) {
    this.payload = v;
  }
  static clone<U>(
    messageFlow: NodeMessageFlow,
    topic: string,
    payload: U
  ): VentilationAdvisorPayloadMessageFlow<U> {
    const cloned = new VentilationAdvisorPayloadMessageFlow<U>(
      topic,
      payload,
      messageFlow.output,
      messageFlow.send
    );
    cloned.payload = cloneDeep<U>(payload);
    cloned.additionalAttributes = {
      ...(messageFlow as any).additionalAttributes,
      ...cloned.additionalAttributes,
    };
    return cloned;
  }
  clone(): VentilationAdvisorPayloadMessageFlow<T> {
    const cloned = new VentilationAdvisorPayloadMessageFlow<T>(
      this.topic!,
      this.value,
      this.output,
      this.send
    );
    cloned.payload = this.payload as T;
    cloned.additionalAttributes = { ...this.additionalAttributes };
    return cloned;
  }
}

export type VentilationAdvisorAdviceMessageFlow =
  VentilationAdvisorPayloadMessageFlow<VentilationAdvisorAdvice>;
export type VentilationAdvisorReasonCodeMessageFlow =
  VentilationAdvisorPayloadMessageFlow<VentilationAdvisorReasonCode[]>;
export type VentilationAdvisorIntensityMessageFlow =
  VentilationAdvisorPayloadMessageFlow<VentilationAdvisorIntensity>;

export enum VentilationAdvisorOutput {
  Advice = 0,
  Reason = 1,
  Intensity = 2,
}
