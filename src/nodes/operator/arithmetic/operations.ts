export function addOp(addends: number[]): number {
  return addends.reduce((acc, value) => acc + value, 0);
}

export function subOp(minuend: number, subtrahends: number[]): number {
  return subtrahends.reduce((acc, value) => acc - value, minuend);
}

export function mulOp(factors: number[]): number {
  return factors.reduce((acc, value) => acc * value, 1);
}

export function roundOp(value: number, precision: number = 0): number {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}

export function meanOp(values: number[]): number {
  return values.length > 0
    ? values.reduce((acc, value) => acc + value, 0) / values.length
    : 0;
}

export function minOp(values: number[]): number {
  return Math.min(...values);
}

export function maxOp(values: number[]): number {
  return Math.max(...values);
}

export interface ArithmeticOperation {
  func: (operand0: any, operand1?: any) => number;
  label: string;
}

export const operations: Record<string, ArithmeticOperation> = {
  add: { func: addOp, label: "+" },
  sub: { func: subOp, label: "-" },
  mul: { func: mulOp, label: "*" },
  round: { func: roundOp, label: "round" },
  mean: { func: meanOp, label: "mean" },
  min: { func: minOp, label: "min" },
  max: { func: maxOp, label: "max" },
};
