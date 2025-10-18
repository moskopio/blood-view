export interface Dict<T> {
  [key: string]: T
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

export const UnitValues = ['mgdl', 'mmoll', 'ul', 'gdl'] as const

export type Unit = typeof UnitValues[number]

export interface Sample {
  calcium:   number
  chloride:  number
  creatine:  number
  glucose:   number
  potassium: number
  protein:   number
  sodium:    number
}

export interface Client {
  id:        string
  birthdate: string
  gender:    number
  ethnicity: number
  samples:   Dict<Sample>
}

export interface ImportedData {
  client_id:            string
  date_testing:         string
  date_birthdate:       string
  gender:               number
  ethnicity:            number
  creatine:             number
  chloride:             number
  fasting_glucose:      number
  potassium:            number
  sodium:               number
  total_calcium:        number
  total_protein:        number
  creatine_unit:        Unit
  chloride_unit:        Unit
  fasting_glucose_unit: Unit
  potassium_unit:       Unit
  sodium_unit:          Unit
  total_calcium_unit:   Unit
  total_protein_unit:   Unit
}
