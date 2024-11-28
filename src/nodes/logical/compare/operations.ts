export function eqCmp(propertyValue: any, compareValue: any): boolean {
  return propertyValue === compareValue;
}

export function neqCmp(propertyValue: any, compareValue: any): boolean {
  return !eqCmp(propertyValue, compareValue);
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
  return !emptyCmp(propertyValue);
}

export function startsWithCmp(
  propertyValue: string,
  compareValue: string
): boolean {
  return propertyValue.startsWith(compareValue);
}

export function endsWithCmp(
  propertyValue: string,
  compareValue: string
): boolean {
  return propertyValue.endsWith(compareValue);
}

export function containsCmp(
  propertyValue: string,
  compareValue: string
): boolean {
  return propertyValue.includes(compareValue);
}

export function regexCmp(propertyValue: string, compareValue: string): boolean {
  return new RegExp(compareValue).test(propertyValue);
}

export interface Comparator {
  func: (propertyValue: any, compareValue?: any) => boolean;
  propertyOnly: boolean;
  label: string;
}

export const comparators: Record<string, Comparator> = {
  eq: { func: eqCmp, propertyOnly: false, label: "==" },
  neq: { func: neqCmp, propertyOnly: false, label: "!=" },
  lt: { func: ltCmp, propertyOnly: false, label: "<" },
  lte: { func: lteCmp, propertyOnly: false, label: "<=" },
  gt: { func: gtCmp, propertyOnly: false, label: ">" },
  gte: { func: gteCmp, propertyOnly: false, label: ">=" },
  true: { func: trueCmp, propertyOnly: true, label: "is true" },
  false: { func: falseCmp, propertyOnly: true, label: "is false" },
  empty: { func: emptyCmp, propertyOnly: true, label: "is empty" },
  not_empty: { func: notEmptyCmp, propertyOnly: true, label: "is not empty" },
  starts_with: {
    func: startsWithCmp,
    propertyOnly: false,
    label: "starts with",
  },
  ends_with: { func: endsWithCmp, propertyOnly: false, label: "ends with" },
  contains: { func: containsCmp, propertyOnly: false, label: "contains" },
  regex: { func: regexCmp, propertyOnly: false, label: "matches regex" },
};
