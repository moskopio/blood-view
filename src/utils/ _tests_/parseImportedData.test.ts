
import { Client, ImportedData } from "src/types"
import { MockSample01, MockSample02, MockSample03, MockSample04, MockSample05 } from "src/utils/ _tests_/mocks"
import { parseImportedData } from "src/utils/parseImportedData"
import { force } from "src/utils/utils"
import { describe, expect, it } from "vitest"

describe('parseImportedData', () => {
  
  it('empty data', () => {
    expect(parseImportedData([]).length).toEqual(0)
  })

  it('correct data', () => {
    const data = [MockSample01, MockSample02, MockSample03]
    const results = parseImportedData(data)
    expect(results.length).toEqual(1)
    expect(results[0].id).toEqual(MockSample01.client_id)
    expect(results[0].samples.length).toEqual(3)
  })
  
  it('filters out incorrect data', () => {
    const data = force<ImportedData[]>([
        MockSample01, 
        {...MockSample02, client_id: '' },
        {...MockSample03, potassium: 'high' }
    ])
    const results = parseImportedData(data)
    expect(results.length).toEqual(1)
    expect(results[0].id).toEqual(MockSample01.client_id)
    expect(results[0].samples.length).toEqual(1)
  })
  
    it('handles multiple clients', () => {
    const data = force<ImportedData[]>([
        MockSample01, 
        MockSample02,
        {...MockSample03, client_id: '123' },
        {...MockSample04, client_id: '123' },
        {...MockSample05, client_id: '456' },
    ])
    const results = parseImportedData(data)
    expect(results.length).toEqual(3)
    const result0 = results.find(r => r.id === MockSample01.client_id) as Client
    const result1 = results.find(r => r.id === '123') as Client
    const result2 = results.find(r => r.id === '456') as Client
    
    expect(result0.samples.length).toEqual(2)
    expect(result1.samples.length).toEqual(2)
    expect(result2.samples.length).toEqual(1)
  })

})
