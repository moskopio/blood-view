import { useContext } from 'react'
import { AppContext } from 'src/state'
import { prepareGraphData } from 'src/utils/prepareGraphData'
import { ClientStats } from './ClientStats'
import './Dashboard.css'
import { DataImport } from './DataImport'
import { GraphSelect } from './GraphSelect'
import { BloodSampleGraph } from './graphs/BloodSample'


export function Dashboard() {
  const { state } = useContext(AppContext)
  const { clients, selectedClient, selectedGraph } = state
  
  const samples = Object.values(clients[selectedClient].samples)
  const data = prepareGraphData(samples, selectedGraph)
  
  return (
    <div className='dashboard'>
      <div className='dashboard-grid'>
        <div className='dashboard-left'>
          <ClientStats />
          <div className='dashboard-horizontal-divider' />
          <DataImport />
        </div>

        <div className='dashboard-vertical-divider' />

        <div>
          <div className='dashboard-right'>
          <GraphSelect />
          </div>
          <BloodSampleGraph data={data} />
        </div>
      </div>
    </div>
  )
}
