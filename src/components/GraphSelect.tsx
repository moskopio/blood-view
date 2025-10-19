import { useCallback, useContext } from 'react'
import { AppContext } from 'src/state'
import { GraphType, GraphTypesValues } from 'src/type'
import './GraphSelect.css'


export function GraphSelect() {
  const { state, stateDispatch } = useContext(AppContext)
  const {selectedGraph } = state
  
  const onSelect = useCallback((selectedGraph: GraphType) => {
    stateDispatch({ selectedGraph })
  }, [stateDispatch]) 
  
  return (
    <div className='graph-select'>
      <div className='graph-select-grid'>
        {GraphTypesValues.map(v => {
          const cls = [
            'graph-select-button',
            v === 'stats' ? 'graph-select-button-stats' : '',
            v === selectedGraph ? 'graph-select-button-active' : '',
          ].join(' ');
          return (
            <button
              key={v}
              type='button'
              className={cls}
              onClick={() => onSelect(v)}
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  );
};
