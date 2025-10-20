import { ImportedData } from "src/types"
import { MockSample01 } from "src/utils/ _tests_/mocks"
import { force } from "src/utils/utils"
import { validateSample } from "src/utils/validateSample"
import { describe, expect, it } from "vitest"


describe('validateSample', () => {
  
  it('empty sample', () => {
    expect(validateSample(force<ImportedData>(null))).toEqual(false)
    expect(validateSample(force<ImportedData>(undefined))).toEqual(false)
    expect(validateSample(force<ImportedData>({}))).toEqual(false)
  })
  
  it('correct sample', () => {
    expect(validateSample(MockSample01)).toEqual(true)
  })
  
  it('sample missing fields', () => {
    const { date_birthdate, sodium, ...rest } = MockSample01
    const sample = force<ImportedData>(rest)
    
    expect(validateSample(sample)).toEqual(false)
  })
  
  it('sample with incorrect units', () => {
    const sample = force<ImportedData>({ ...MockSample01, creatine_unit: 'high' })
    
    expect(validateSample(sample)).toEqual(false)
  })
  
  it('sample with incorrect values', () => {
    const sample = force<ImportedData>({ ...MockSample01, potassium: 'high' })
    
    expect(validateSample(sample)).toEqual(false)
  })
  
  it('sample with incorrect dates', () => {
    const sample = force<ImportedData>({ ...MockSample01, date_testing: 'yesterday' })
    
    expect(validateSample(sample)).toEqual(false)
  })
  
})
