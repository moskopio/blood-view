import { createContext, Dispatch, useMemo, useReducer } from 'react'
import { Client, DeepPartial, GraphType, ImportedData } from 'src/type'
import { MockSample01, MockSample02, MockSample03, MockSample04, MockSample05, MockSample06 } from 'src/utils/ _tests_/mocks'
import { deepSet } from 'src/utils/merge'
import { parseImportedData } from 'src/utils/parseImportedData'


interface State {
  clients:        Client[]
  selectedClient: number
  selectedGraph:  GraphType
}

interface AppState {
  state:         State
  stateDispatch: Dispatch<DeepPartial<State>>
}

export function createDefaultState() {
  //TOOD: not use mock data!
  const data = [
    MockSample01,
    MockSample02,
    MockSample03,
    MockSample04,
    MockSample05,
    MockSample06,
    {...MockSample01, client_id: '123' },
    {...MockSample01, client_id: '456' },
  ] as ImportedData[]
  const clients = parseImportedData(data)
  const selectedClient = 0
  const selectedGraph = 'calcium' as GraphType
  
  return { clients, selectedClient, selectedGraph }
}

export function stateReducer(state: State, action: DeepPartial<State>) {
  return deepSet<State>(state, action)
}

export function useAppState() {
  const [state, stateDispatch] = useReducer(stateReducer, createDefaultState())
  
  return useMemo(() => ({ state, stateDispatch }), [state, stateDispatch])
}

export const AppContext = createContext<AppState>({} as unknown as AppState)
