import {
  VentilationAdvisorLimit,
  VentilationAdvisorRoomType,
  VentilationAdvisorRoomTypeMeta,
} from "./types";

export const VentilationAdvisorRoomTypeMetadata: Record<
  VentilationAdvisorRoomType,
  VentilationAdvisorRoomTypeMeta
> = {
  [VentilationAdvisorRoomType.Living]: {
    relativeHumidity: { warn: 60, critical: 70 },
    dewPointDelta: { warn: 2, critical: 1 },
    absoluteHumidityDifference: { min: 1, max: 3 },
  },
  [VentilationAdvisorRoomType.Bedroom]: {
    relativeHumidity: { warn: 55, critical: 65 },
    dewPointDelta: { warn: 2, critical: 1 },
    absoluteHumidityDifference: { min: 1, max: 3 },
  },
  [VentilationAdvisorRoomType.Wet]: {
    relativeHumidity: { warn: 70, critical: 80 },
    dewPointDelta: { warn: 3, critical: 2 },
    absoluteHumidityDifference: { min: 2, max: 4 },
  },
  [VentilationAdvisorRoomType.Cellar]: {
    relativeHumidity: { warn: 65, critical: 75 },
    dewPointDelta: { warn: 2, critical: 1 },
    absoluteHumidityDifference: { min: 1, max: 3 },
  },
};

export const VentilationAdvisorCo2Limits: VentilationAdvisorLimit = {
  warn: 1000,
  critical: 1400,
};

export const VentilationAdvisorVocLimits: Record<
  "ugm3" | "ppb" | "index",
  VentilationAdvisorLimit
> = {
  ugm3: { warn: 300, critical: 600 },
  ppb: { warn: 200, critical: 400 },
  index: { warn: 2, critical: 3 },
};
