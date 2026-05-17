export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}
