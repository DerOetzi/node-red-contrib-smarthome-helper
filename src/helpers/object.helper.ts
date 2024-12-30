export function cloneDeep<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function isEqual(value: any, other: any): boolean {
  if (value === other) return true;

  if (
    value &&
    typeof value === "object" &&
    other &&
    typeof other === "object"
  ) {
    if (Object.keys(value).length !== Object.keys(other).length) return false;

    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        if (!isEqual(value[key], other[key])) return false;
      }
    }

    return true;
  }

  return false;
}
