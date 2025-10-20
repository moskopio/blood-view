import { GraphType, GraphTypesValues, Sample } from "src/types"
import * as d3 from "d3"

export function prepareSampleData(samples: Sample[], type: GraphType) {
  if (type === 'stats') return []
  
  return samples.map(sample => ({ date: sample.date, value: sample[type]}))
}

export function prepareStatsData(samples: Sample[], type: GraphType) {
  if (type !== 'stats') return []
  
  return GraphTypesValues.filter(type => type !== 'stats').map(type => {
    const data = samples.map(sample => sample[type])
    const name = type
    const min = d3.min(data) || 0
    const max = d3.max(data) || 0
    const avg = d3.mean(data) || 0
    const median = d3.median(data) || 0
    
    return { name, min, max, avg, median }
  })
}
