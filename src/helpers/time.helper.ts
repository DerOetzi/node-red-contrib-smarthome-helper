const timeUnits: Record<string, any> = {
  ms: 1,
  s: 1000,
  m: 1000 * 60,
  h: 1000 * 60 * 60,
  d: 1000 * 60 * 60 * 24,
};

export function convertToMilliseconds(
  time: number,
  unit: string = "s"
): number {
  return time * timeUnits[unit];
}
