function eqCmp(propertyValue: any, compareValue: any): boolean {
  return propertyValue === compareValue;
}

function neqCmp(propertyValue: any, compareValue: any): boolean {
  return !eqCmp(propertyValue, compareValue);
}

function ltCmp(propertyValue: any, compareValue: any): boolean {
  return propertyValue < compareValue;
}

function lteCmp(propertyValue: any, compareValue: any): boolean {
  return propertyValue <= compareValue;
}

function gtCmp(propertyValue: any, compareValue: any): boolean {
  return propertyValue > compareValue;
}

function gteCmp(propertyValue: any, compareValue: any): boolean {
  return propertyValue >= compareValue;
}

function trueCmp(propertyValue: boolean): boolean {
  return propertyValue === true;
}

function falseCmp(propertyValue: boolean): boolean {
  return propertyValue === false;
}

function emptyCmp(propertyValue: any): boolean {
  return (
    propertyValue === "" ||
    propertyValue === undefined ||
    propertyValue === null
  );
}

function notEmptyCmp(propertyValue: any): boolean {
  return !emptyCmp(propertyValue);
}

export interface Comparator {
  func: (propertyValue: any, compareValue?: any) => boolean;
  propertyOnly: boolean;
}

export const comparators: Record<string, Comparator> = {
  eq: { func: eqCmp, propertyOnly: false },
  neq: { func: neqCmp, propertyOnly: false },
  lt: { func: ltCmp, propertyOnly: false },
  lte: { func: lteCmp, propertyOnly: false },
  gt: { func: gtCmp, propertyOnly: false },
  gte: { func: gteCmp, propertyOnly: false },
  true: { func: trueCmp, propertyOnly: true },
  false: { func: falseCmp, propertyOnly: true },
  empty: { func: emptyCmp, propertyOnly: true },
  not_empty: { func: notEmptyCmp, propertyOnly: true },
};
