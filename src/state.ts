import { createContext, useMemo, useReducer } from "react"
import { Client, DeepPartial, ImportedData } from "src/type"
import { MockSample01, MockSample02, MockSample03, MockSample04, MockSample05, MockSample06 } from "src/utils/ _tests_/mocks"
import { deepSet } from "src/utils/merge"
import { parseImportedData } from "src/utils/parseImportedData"

interface AppState {
  clients:        Client[]
  selectedClient: string
}


export function createDefaultAppState() {
  //TOOD: not use mock data!
  const data = [MockSample01, MockSample02, MockSample03, MockSample04, MockSample05, MockSample06] as ImportedData[]
  const clients = parseImportedData(data)
  const selectedClient = MockSample01.client_id 
  
  return { clients, selectedClient }
}

export function stateReducer(state: AppState, action: DeepPartial<AppState>) {
  return deepSet<AppState>(state, action)
}

export function useAppState() {
  const [state, stateDispatch] = useReducer(stateReducer, createDefaultAppState())
  
  return useMemo(() => ({ state, stateDispatch }), [state, stateDispatch])
}

export const AppContext = createContext<AppState>({} as unknown as AppState)
