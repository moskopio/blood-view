import React, { useCallback, useRef, useState } from 'react';
import './DataImport.css';

export function DataImport() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [url, setUrl] = useState('google.com');

  const onPick = () => fileRef.current?.click();
  
  // TODO: proper import methods!
  const onLoadFile = useCallback((json: any, file: any) => {
    console.log('Loaded JSON file:', file.name, json);
  }, [])
  
  const onLoadUrl = useCallback((url: any) => { 
    console.log('Load from URL:', url);
  }, [])

  const onFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.json')) { console.error('Please select a .json file.'); return; }
    try {
      const text = await f.text();
      onLoadFile?.(JSON.parse(text), f);
    } catch {
      console.error('Please select a .json file.')
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  }, []);

  return (
    <section className='data-import'>
      <div className='data-import-pill'>
        <button type='button' onClick={onPick} className='data-import-button' >Load JSON file...</button>
        <input ref={fileRef} type='file' accept='.json,application/json' onChange={onFile} style={{ display: 'none' }} />
      </div>

      <div className='data-import-pill'>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder='https://example.com/data.json'
          className='data-import-input'
        />
        <button type='button' onClick={() => onLoadUrl?.(url.trim())} className='data-import-button'>
          Load URL
        </button>
      </div>
    </section>
  );
};
