/** HappyDev - Offline Developer Utilities Suite
 * @author TNQSW
 * @license MIT (with Trademark Retention Notice)
 * Copyright (c) 2026 TNQSW. Retain TNQ trademark, author credits and notices.
 */
import { TextInput } from '../../components/common/TextInput';
import React, { useState } from 'react';
import { CodeEditor } from '../../components/common/CodeEditor';
import { jsonToPython, pythonToJson } from '../../lib/jsonPython';

const example = '{\n  "id": 1,\n  "name": "Alice",\n  "active": true,\n  "address": { "city": "Hanoi" },\n  "tags": ["developer"]\n}';

export const JsonPythonConverter: React.FC = () => {
  const [direction, setDirection] = useState<'json' | 'python'>('json');
  const [input, setInput] = useState('');
  const [style, setStyle] = useState<'dataclass' | 'pydantic'>('dataclass');
  const [rootName, setRootName] = useState('RootDto');
  let output = '';
  let error = '';
  if (input.trim()) {
    try {
      output = direction === 'json' ? jsonToPython(input, rootName.trim() || 'RootDto', style) : pythonToJson(input, rootName);
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'Unable to convert input.';
    }
  }
  const changeDirection = (next: 'json' | 'python') => {
    if (next === direction) return;
    setInput(output || '');
    setRootName(next === 'json' ? rootName || 'RootDto' : '');
    setDirection(next);
  };
  return (
    <div className="flex-1 flex flex-col h-full space-y-4 min-h-[540px]">
      <div className="card-3d p-4.5 sm:p-5 rounded-2xl flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2.5">
            {(['json', 'python'] as const).map(mode => (
              <button key={mode} type="button" onClick={() => changeDirection(mode)} aria-pressed={direction === mode}
                className={`btn-3d px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition ${direction === mode ? 'btn-3d-active' : 'text-[var(--text-secondary)]'}`}>
                {mode === 'json' ? 'JSON → Python DTO' : 'Python DTO → JSON'}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setInput(direction === 'json' ? example : jsonToPython(example, 'RootDto', style)); setRootName(direction === 'json' ? 'RootDto' : ''); }} className="btn-3d px-3.5 py-2 rounded-xl text-xs font-medium cursor-pointer">Example</button>
            <button type="button" onClick={() => setInput('')} className="btn-3d px-3.5 py-2 rounded-xl text-xs font-medium cursor-pointer">Clear</button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3.5 text-xs text-[var(--text-secondary)] pt-3.5 border-t border-[var(--border-color)]">
          <label htmlFor="python-dto-root" className="font-semibold text-[var(--text-primary)]">{direction === 'json' ? 'Class name:' : 'Root class:'}</label>
          <TextInput id="python-dto-root" value={rootName} onChange={e => setRootName(e.target.value)} placeholder={direction === 'python' ? 'Last class by default' : 'RootDto'} className="input-3d px-3.5 py-2 rounded-lg text-xs" />
          {direction === 'json' && <label className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">DTO style:
            <select value={style} onChange={e => setStyle(e.target.value as 'dataclass' | 'pydantic')} className="input-3d px-3.5 py-2 rounded-lg text-xs">
              <option value="dataclass">Dataclass</option><option value="pydantic">Pydantic</option>
            </select>
          </label>}
          <span className="text-[11px] text-[var(--text-muted)]">{direction === 'json' ? 'Python 3.9+ type hints & nested DTOs.' : 'Sample JSON from annotated classes.'}</span>
        </div>
      </div>
      {error && <div role="alert" className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono">{error}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[460px]">
        <CodeEditor label={direction === 'json' ? 'JSON Input' : 'Python DTO Input'} language={direction === 'json' ? 'json' : 'python'} value={input} onChange={setInput} placeholder={direction === 'json' ? 'Paste a JSON object...' : 'Paste Python classes or records...'} />
        <CodeEditor label={direction === 'json' ? 'Generated Python DTO' : 'Generated Sample JSON'} language={direction === 'json' ? 'python' : 'json'} value={output} readOnly placeholder="Converted output appears automatically..." />
      </div>
    </div>
  );
};
