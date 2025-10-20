import { useCallback, useContext } from 'react'
import { AppContext } from 'src/state'
import { GraphType, GraphTypesValues } from 'src/types'
import './GraphSelect.css'


export function GraphSelect() {
  const { state, stateDispatch } = useContext(AppContext)
  const {selectedGraph } = state
  
  const onSelect = useCallback((selectedGraph: GraphType) => {
    stateDispatch({ selectedGraph })
  }, [stateDispatch])
  
  return (
    <div className='graph-select'>
      {GraphTypesValues.map(v => {
        const cls = [
          'graph-select-button',
          v === 'stats' ? 'graph-select-button-stats' : '',
          v === selectedGraph ? 'graph-select-button-active' : '',
        ].join(' ')
        return <div key={v} className={cls} onClick={() => onSelect(v)}>{v}</div>
      })}
    </div>
  )
}
