import { createContext, Dispatch, useMemo, useReducer } from 'react'
import { Client, DeepPartial, GraphType, ImportedData } from 'src/types'
import { MockSample01, MockSample02, MockSample03 } from 'src/utils/ _tests_/mocks'
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


function loadStoredData() {
  const storedData = localStorage.getItem('storedData')
  return storedData ? JSON.parse(storedData) as State : {}
}

function createDefaultData() {
  const data = [ MockSample01, MockSample02, MockSample03,] as ImportedData[]
  const clients = parseImportedData(data)
  const selectedClient = 0
  const selectedGraph = 'calcium' as GraphType
  
  return { clients, selectedClient, selectedGraph }
}

function loadAppState() {
  return {...createDefaultData(), ...loadStoredData() }
}

function stateReducer(state: State, action: DeepPartial<State>) {
  const newState = deepSet<State>(state, action)
  localStorage.setItem('storedData', JSON.stringify(newState))
  
  return newState
}

export function useAppState() {
  const [state, stateDispatch] = useReducer(stateReducer, loadAppState())
  
  return useMemo(() => ({ state, stateDispatch }), [state, stateDispatch])
}

export const AppContext = createContext<AppState>({} as unknown as AppState)
