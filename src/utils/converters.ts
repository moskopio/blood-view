import { Unit } from "src/types"

export function mmollToMgdl(mmoll: number) {
  return mmoll * 18.018
}

export function ulToMgdl(ul: number) {
  return ul * 100
}

export function gdlToMgdl(gdl: number) {
  return gdl * 1000
}

export function convertValue(value: number, unit: Unit) {
  switch (unit) {
    case 'mgdl': 
      return value
    case 'mmoll': 
      return mmollToMgdl(value)
    case 'ul':
      return ulToMgdl(value)
    case 'gdl':
      return gdlToMgdl(value)
  }
}
