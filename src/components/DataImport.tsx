import { useRef } from 'react'
import { useFetchData } from 'src/hooks/fetchData'
import { useUploadData } from 'src/hooks/uploadData'
import './DataImport.css'

export function DataImport() {
  const fileRef = useRef<HTMLInputElement | null>(null)
  const onPick = () => fileRef.current?.click()
  
  const fetchData = useFetchData()
  const uploadData = useUploadData()

  return (
    <div className='data-import'>
        <div onClick={onPick} className='data-import-button' >Upload JSON file...</div>
        <input ref={fileRef} type='file' accept='.json,application/json' onChange={uploadData} style={{ display: 'none' }} />
        <div onClick={fetchData} className='data-import-button'>
          Fetch from Mock Server...
        </div>
    </div>
  )
}
