import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AppContext } from 'src/state'
import { Client } from 'src/type'
import './ClientStats.css'


export function ClientStats() {
  const { state, stateDispatch } = useContext(AppContext)
  const { clients, selectedClient } = state

  const current = clients[selectedClient]
  const samplesCount = current?.samples.length

  const [open, setOpen] = useState(false)

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
  },[setOpen])
  
  const onSelect = useCallback((selectedClient: number) => {
    stateDispatch({ selectedClient})
  },[stateDispatch])

  return (
    <div className='stats' ref={rootRef}>
      <div className='stats-id-root'>
        <div className='stats-id-button' onClick={onIdClick}>
          {current.id}
          <span className='caret' />
        </div>

        {open && 
          <ClientSelection 
            clients={clients} 
            onClose={() => setOpen(false)} 
            onSelect={onSelect} 
            selectedClient={selectedClient} 
          />
        }
      </div>

      <div className='stats-hr' />

      <div className='stats-content'>
        <StatsItem label='Birthdate' value={current.birthdate} />
        <StatsItem label='Gender' value={genderToLabel(current.gender)} />
        <StatsItem label='Ethnicity' value={ethnicityToLabel(current.ethnicity)} />
        <StatsItem label='Samples' value={samplesCount} />
      </div>
    </div>
  )
}


interface ClientSelectionProps {
  clients: Client[]
  onClose(): void
  onSelect(id: number): void
  selectedClient: number
}

function ClientSelection(props: ClientSelectionProps) {
  const { clients,onClose, onSelect, selectedClient} = props
  const [focusIndex, setFocusIndex] = useState<number>(selectedClient)
    
  return (
    <div className='stats-menu'>
      {clients.map((p, i) => (
        <div
          key={p.id}
          className={[
            'item',
            i === selectedClient ? 'active' : '',
            i === focusIndex ? 'focus' : '',
          ].join(' ')}
          onClick={() => { onSelect(i); onClose() }}
          onMouseEnter={() => setFocusIndex(i)}
        >
          <span className="id">{p.id}</span>
          <span className="birthdate">{p.birthdate}</span>
        </div>
      ))}
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

const ethnicityMap = ['human', 'elf', 'half-elf', 'orc', 'halfing', 'lizardman'] as const
export function ethnicityToLabel(ethnicity: number) {
  return ethnicityMap[ethnicity] || 'other'
}

const genderMap = ['female', 'male']
export function genderToLabel(gender: number) {
  return genderMap[gender] || 'other'
}

