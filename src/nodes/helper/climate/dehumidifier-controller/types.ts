import { TimeIntervalUnit } from "../../../../helpers/time.helper";
import { BaseNodeOptionsDefaults } from "../../../flowctrl/base/types";
import {
  MatchJoinEditorNodeProperties,
  MatchJoinNodeDef,
  MatchJoinNodeOptions,
} from "../../../flowctrl/match-join/types";

export enum DehumidifierControllerTarget {
  humidity = "humidity",
  temperature = "temperature",
  windowOpen = "windowOpen",
  compressorActive = "compressorActive",
  nightMode = "nightMode",
  absenceMode = "absenceMode",
}

export interface DehumidifierControllerNodeInputs {
  humidity?: number;
  temperature?: number;
  nightMode: boolean;
  absenceMode: boolean;
  compressorActive: boolean;
  windowOpen: Record<string, boolean>;
}

export interface DehumidifierControllerNodeOptions
  extends MatchJoinNodeOptions {
  minHumidity: number;
  maxHumidity: number;
  baseTarget: number;
  hysteresis: number;
  tempSlope: number;
  tempOnMin: number;
  tempOffMin: number;
  tempOffMax: number;
  windowEnabled: boolean;
  windowDelay: number;
  windowDelayUnit: TimeIntervalUnit;
  minOnTime: number;
  minOnTimeUnit: TimeIntervalUnit;
  minOffTime: number;
  minOffTimeUnit: TimeIntervalUnit;
}

export const DehumidifierControllerNodeOptionsDefaults: DehumidifierControllerNodeOptions =
  {
    ...BaseNodeOptionsDefaults,
    matchers: [],
    join: false,
    discardNotMatched: true,
    minMsgCount: 1,
    outputs: 1,
    minHumidity: 45,
    maxHumidity: 60,
    baseTarget: 50,
    hysteresis: 5,
    tempSlope: 2,
    tempOnMin: 15,
    tempOffMin: 13,
    tempOffMax: 22,
    windowEnabled: false,
    windowDelay: 5,
    windowDelayUnit: TimeIntervalUnit.m,
    minOnTime: 10,
    minOnTimeUnit: TimeIntervalUnit.m,
    minOffTime: 10,
    minOffTimeUnit: TimeIntervalUnit.m,
  };

export interface DehumidifierControllerNodeDef
  extends MatchJoinNodeDef,
    DehumidifierControllerNodeOptions {}

export interface DehumidifierControllerEditorNodeProperties
  extends MatchJoinEditorNodeProperties,
    DehumidifierControllerNodeOptions {}
