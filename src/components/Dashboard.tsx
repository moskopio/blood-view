import { useContext } from 'react'
import { AppContext } from 'src/state'
import { ClientStats } from './ClientStats'
import './Dashboard.css'
import { DataImport } from './DataImport'
import { GraphSelect } from './GraphSelect'
import { BloodSampleGraph } from './graphs/BloodSample'
import { BloodStatsGraph } from './graphs/BloodStats'


export function Dashboard() {
  const { state } = useContext(AppContext)
  const { selectedGraph } = state
  
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
