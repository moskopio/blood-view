import { DeepPartial } from "src/types"
import { isObject } from "src/utils/utils"

export function deepSet<T>(target: T, source: T | DeepPartial<T>) {
  return deepMerge(target, source)
}

function deepMerge<T>(target: T, source: T | DeepPartial<T>) {
  //eslint-disable-next-line
  const result: any = {} 
  
  if (isObject(target) && isObject(source)) {
    for (const key in target) {
      if (isObject(source[key]) && isObject(target[key])) {
        result[key] = deepMerge(target[key], source[key])
      } else {
        result[key] = source[key] ?? target[key]
      }
    }
  }
  
  return result
}
