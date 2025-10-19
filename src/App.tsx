import { Dashboard } from "src/components/Dashboard"
import { AppContext, useAppState } from "src/state"


export function App() {
  const state = useAppState()
  
  return (
    <AppContext.Provider value={state}>
      <Dashboard />
    </AppContext.Provider>
  )
}
