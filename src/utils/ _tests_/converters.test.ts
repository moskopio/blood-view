import { describe } from "node:test"
import { convertValue, gdlToMgdl, mmollToMgdl, ulToMgdl } from "src/utils/converters"
import { expect, it } from "vitest"

describe('Converters', () => {
  
  it('convertValue', () => {
    expect(convertValue(10, 'mgdl')).toEqual(10)
    expect(convertValue(10, 'mmoll')).toEqual(10 * 18.018)
    expect(convertValue(10, 'ul')).toEqual(1000)
    expect(convertValue(10, 'gdl')).toEqual(10000)
  })
  
  it('mmollToMgdl', () => {
    expect(mmollToMgdl(0)).toEqual(0)
    expect(mmollToMgdl(1)).toEqual(18.018)
    expect(mmollToMgdl(5)).toEqual(5 * 18.018)
    expect(mmollToMgdl(10)).toEqual(10 * 18.018)
  })
  
  it('ulToMgdl', () => {
    expect(ulToMgdl(0)).toEqual(0)
    expect(ulToMgdl(1)).toEqual(100)
    expect(ulToMgdl(5)).toEqual(500)
    expect(ulToMgdl(10)).toEqual(1000)
  })
  
  it('gdlToMgdl', () => {
    expect(gdlToMgdl(0)).toEqual(0)
    expect(gdlToMgdl(1)).toEqual(1000)
    expect(gdlToMgdl(5)).toEqual(5000)
    expect(gdlToMgdl(10)).toEqual(10000)
  })
})
