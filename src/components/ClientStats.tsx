import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AppContext } from 'src/state'
import './ClientStats.css'


// TODO: divide stats select to seperate component!
export function ClientStats() {
  const { state, stateDispatch } = useContext(AppContext)
  const { clients, selectedClient } = state

  const current = clients[selectedClient]
  const samplesCount = current?.samples.length

  const [open, setOpen] = useState(false)
  const [focusIndex, setFocusIndex] = useState<number>(selectedClient)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
    }
  }, [])
  
  const onIdClick = useCallback(() => {
    setOpen(open => !open)
    setFocusIndex(selectedClient)
  },[setOpen, setFocusIndex])
  
  const onSelect = useCallback((selectedClient: number) => {
    stateDispatch({ selectedClient})
  },[stateDispatch])

  return (
    <div className='stats' ref={rootRef}>
      <div className='stats-id-root'>
        <button
          type='button'
          className='stats-id-button'
          onClick={onIdClick}
          title={current.id}
        >
          {current.id}
          <span className='stats-caret' />
        </button>

        {open && (
          <div className='stats-menu'>
            {clients.map((p, i) => (
              <div
                key={p.id + i}
                className={[
                  'stats-item',
                  i === selectedClient ? 'stats-item-active' : '',
                  i === focusIndex ? 'stats-item-focus' : '',
                ].join(' ')}
                onClick={() => { onSelect(i); setOpen(false) }}
                onMouseEnter={() => setFocusIndex(i)}
              >
                <span style={{ fontWeight: 800, color: 'var(--accent-pink-150)', textTransform: 'uppercase' }}>
                  {p.id}
                </span>
                <span style={{ color: 'var(--ink-50)', fontSize: 11 }}>{p.birthdate}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='stats-hr' />

      <div style={{ display: 'grid', gap: 6 }}>
        <StatsItem label='Birthdate' value={current.birthdate} />
        <StatsItem label='Gender' value={current.gender} />
        <StatsItem label='Ethnicity' value={current.ethnicity} />
        <StatsItem label='Samples' value={samplesCount} />
      </div>
    </div>
  )
}

interface ItemProps {
  label: string
  value: string | number
}

function StatsItem({label, value}: ItemProps) {
  return (
    <div className='stats-pill'>
      <span className='stats-label'>{label}</span>
      <span className='stats-value'>{value}</span>
    </div>
  )
}
