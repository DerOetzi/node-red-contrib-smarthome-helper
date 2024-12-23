export function andOp(payloads: boolean[]): boolean {
  return payloads.every((value: boolean) => value === true);
}

export function orOp(payloads: boolean[]): boolean {
  return payloads.some((value: boolean) => value === true);
}

export function notOp(payload: boolean): boolean {
  return !payload;
}

export function nandOp(payloads: boolean[]): boolean {
  return notOp(andOp(payloads));
}

export function norOp(payloads: boolean[]): boolean {
  return notOp(orOp(payloads));
}

export function xorOp(payloads: boolean[]): boolean {
  return payloads.filter((value) => value === true).length === 1;
}

export function nxorOp(payloads: boolean[]): boolean {
  return notOp(xorOp(payloads));
}

export interface LogicalOperation {
  func: (payloads: boolean[]) => boolean;
}

export const logicalOperations: Record<string, LogicalOperation> = {
  and: { func: andOp },
  or: { func: orOp },
  nand: { func: nandOp },
  nor: { func: norOp },
  xor: { func: xorOp },
  nxor: { func: nxorOp },
};
