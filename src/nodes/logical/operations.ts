import exp from "constants";

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

export function ltCmp(propertyValue: any, compareValue: any): boolean {
  return propertyValue < compareValue;
}

export function lteCmp(propertyValue: any, compareValue: any): boolean {
  return propertyValue <= compareValue;
}

export function gtCmp(propertyValue: any, compareValue: any): boolean {
  return propertyValue > compareValue;
}

export function gteCmp(propertyValue: any, compareValue: any): boolean {
  return propertyValue >= compareValue;
}

export function trueCmp(propertyValue: boolean): boolean {
  return propertyValue === true;
}

export function falseCmp(propertyValue: boolean): boolean {
  return propertyValue === false;
}

export function emptyCmp(propertyValue: any): boolean {
  return (
    propertyValue === "" ||
    propertyValue === undefined ||
    propertyValue === null
  );
}

export function notEmptyCmp(propertyValue: any): boolean {
  return notOp(emptyCmp(propertyValue));
}
