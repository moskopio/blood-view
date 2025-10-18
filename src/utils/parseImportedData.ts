import { Client, Dict, ImportedData, Sample } from "src/type"
import { convertValue } from "src/utils/converters"
import { validateSample } from "src/utils/validateSample"

export function parseImportedData(data: ImportedData[]): Client[] {
  // 1. Filter out incorrect samples
  const validData = data.filter(validateSample)
  
  // 2. Sort samples by date
  const sortedData = validData.sort((s1, s2) => Date.parse(s1.date_testing) - Date.parse(s2.date_testing))
  
  // 3. Divide samples per client_id
  const dataByClientId: Dict<ImportedData[]> = {}

  sortedData.forEach(data => {
    const id = data.client_id
    dataByClientId[id] = [...(dataByClientId[id] ? dataByClientId[id] : []), data]
  })
  
  // 4. Create Clients data structure
  const clients = Object.values(dataByClientId).map(parseClient)

  return clients
}

function parseClient(data: ImportedData[]): Client {
  // Since various samples can have different meta data, we should grab meta from the last sample 
  // and assume it is the most accurate. 
  // Note: At this point we know that the data is sorted by date_testing.
  const lastSample = data[data.length - 1]
  
  const id = lastSample.client_id
  const birthdate = lastSample.date_birthdate
  const gender = lastSample.gender
  const ethnicity = lastSample.ethnicity
  const samples: Dict<Sample> = { }
  data.forEach(d => samples[d.date_testing] = parseSample(d))
  
  return { id, birthdate, gender, ethnicity, samples }
}

// TODO: Do I really want to process samples to common values? I'm not sure
function parseSample(data: ImportedData): Sample {
  const creatine = convertValue(data.creatine, data.creatine_unit);
  const chloride = convertValue(data.chloride, data.chloride_unit);
  const glucose = convertValue(data.fasting_glucose, data.fasting_glucose_unit);
  const potassium = convertValue(data.potassium, data.potassium_unit);
  const sodium = convertValue(data.sodium, data.sodium_unit);
  const calcium = convertValue(data.total_calcium, data.total_calcium_unit);
  const protein = convertValue(data.total_protein, data.total_protein_unit);
  
  return { creatine, chloride, glucose, potassium, sodium, calcium, protein }
}
