import { Unit, UnitValues } from "src/type"

export function force<T>(value: unknown) {
  return value as T
}

export function isObject<T>(item: unknown): item is T {
  return isDefined(item) && typeof item === 'object' && !Array.isArray(item)
}

export function isDefined<T>(obj: unknown): obj is NonNullable<T> {
  return obj !== undefined && obj !== null
}

export function isString(value: unknown): value is string {
  return typeof (value) === 'string' && value !== ''
}

export function isDate(value: unknown): value is string {
  return isString(value) && !!Date.parse(value)
}

export function isNumber(x: unknown): x is number {
  return !isNaN(x as number)
}

export function isUnit(value: unknown): value is Unit {
  return typeof value === 'string' && UnitValues.includes(value as Unit)
}
