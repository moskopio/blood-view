import { GraphType, Sample } from "src/type"

export function prepareGraphData(samples: Sample[], type: GraphType) {
  
  if (type === 'stats') {
    return []
   // generate summary data  
  } else {
    
    return samples.map(sample => ({ date: sample.date, value: sample[type]}))
  }
  
}
