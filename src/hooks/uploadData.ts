import { ChangeEvent, useCallback, useContext } from 'react'
import { AppContext } from 'src/state'
import { ImportedData } from 'src/types'
import { parseImportedData } from '../utils/parseImportedData'


export function useUploadData() {
  const { stateDispatch } = useContext(AppContext)
  
  return useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) throw new Error('Invalid file uploaded')
      
      const text = await file.text()
      const importedData = JSON.parse(text) as ImportedData[]

      const parsedData = parseImportedData(importedData)

      if (parsedData && parsedData.length > 0) {
        stateDispatch({ clients: parsedData, selectedClient: 0, selectedGraph: 'stats' })
      }
  } catch (e) {
    console.error(e)
  }
  }, [stateDispatch])
}
