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

export function eqCmp(propertyValue: any, compareValue: any): boolean {
  return propertyValue === compareValue;
}

export function neqCmp(propertyValue: any, compareValue: any): boolean {
  return notOp(eqCmp(propertyValue, compareValue));
}
