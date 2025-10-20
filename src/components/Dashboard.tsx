import { useContext } from 'react'
import { BloodStatsGraph } from 'src/components/graphs/BloodStats'
import { AppContext } from 'src/state'
import { prepareSampleData } from 'src/utils/prepareGraphData'
import { ClientStats } from './ClientStats'
import './Dashboard.css'
import { DataImport } from './DataImport'
import { GraphSelect } from './GraphSelect'
import { BloodSampleGraph } from './graphs/BloodSample'


export function Dashboard() {
  const { state } = useContext(AppContext)
  const { clients, selectedClient, selectedGraph } = state
  
  const samples = Object.values(clients[selectedClient].samples)
  const data = prepareSampleData(samples, selectedGraph)
  
  return (
    <div className='dashboard'>
      
      <div className='left'>
        <ClientStats />
        <div className='horizontal-divider' />
        <DataImport />
      </div>

      <div className='vertical-divider' />

      <div>
        <div className='right'>
        <GraphSelect />
        </div>
        { selectedGraph === 'stats' 
          ? <BloodStatsGraph /> 
          : <BloodSampleGraph /> }
      </div>
      
    </div>
  )
}
