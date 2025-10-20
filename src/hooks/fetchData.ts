import { useCallback, useContext } from 'react'
import { AppContext } from 'src/state'
import { ImportedData } from 'src/types'
import { parseImportedData } from 'src/utils/parseImportedData'

const URL = 'mock/data'

export function useFetchData() {
  const { stateDispatch } = useContext(AppContext)
  
  return useCallback(async () => {  
    try {
      const result = await fetch(URL)
      
      if (!result.ok) throw new Error(`HTTP ${result.status} ${result.statusText}`)

      const importedData = await result.json() as ImportedData[]
      const parsedData = parseImportedData(importedData)
      
      if (parsedData && parsedData.length > 0) {
        stateDispatch({ clients: parsedData, selectedClient: 0, selectedGraph: 'stats' })
      }
      
    }
    catch (e) {
      console.error(e)
    }
  },[stateDispatch])
}
