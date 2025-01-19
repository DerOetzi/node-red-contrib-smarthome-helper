export enum TimeIntervalUnit {
  ms = "ms",
  s = "s",
  m = "m",
  h = "h",
  d = "d",
}

const TimeIntervalUnitFactors: Record<TimeIntervalUnit, { factor: number }> = {
  [TimeIntervalUnit.ms]: { factor: 1 },
  [TimeIntervalUnit.s]: { factor: 1000 },
  [TimeIntervalUnit.m]: { factor: 1000 * 60 },
  [TimeIntervalUnit.h]: { factor: 1000 * 60 * 60 },
  [TimeIntervalUnit.d]: { factor: 1000 * 60 * 60 * 24 },
};

export function convertToMilliseconds(
  time: number,
  unit: TimeIntervalUnit = TimeIntervalUnit.ms
): number {
  return time * TimeIntervalUnitFactors[unit].factor;
}
