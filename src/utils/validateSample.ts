import { ImportedData } from "src/types"
import { isDate, isNumber, isString, isUnit } from "./utils"

export function validateSample(sample: ImportedData) {
  if (!sample) return false
  
  const isIdValid = isString(sample.client_id)
  
  const areMetadataValid = isDate(sample.date_testing)
    && isDate(sample.date_birthdate)
    && isNumber(sample.gender)
    && isNumber(sample.ethnicity)
  
  const areNumericsValid = isNumber(sample.creatine)
    && isNumber(sample.chloride)
    && isNumber(sample.fasting_glucose)
    && isNumber(sample.potassium)
    && isNumber(sample.sodium)
    && isNumber(sample.total_calcium)
    && isNumber(sample.total_protein)
  
  const areUnitsValid = isUnit(sample.creatine_unit)
    && isUnit(sample.chloride_unit)
    && isUnit(sample.fasting_glucose_unit)
    && isUnit(sample.potassium_unit)
    && isUnit(sample.sodium_unit)
    && isUnit(sample.total_calcium_unit)
    && isUnit(sample.total_protein_unit)
  
  return isIdValid && areMetadataValid && areNumericsValid && areUnitsValid
}

