/** HappyDev - Offline Developer Utilities Suite
 * @author TNQSW
 * @license MIT (with Trademark Retention Notice)
 * Copyright (c) 2026 TNQSW. Retain TNQ trademark, author credits and notices.
 */
import { TextInput } from '../../components/common/TextInput';
import React, { useState } from 'react';
import { CodeEditor } from '../../components/common/CodeEditor';
import { jsonToJava, javaToJson } from '../../lib/jsonJava';

const example = '{\n  "id": 1,\n  "name": "Alice",\n  "active": true,\n  "address": { "city": "Hanoi" },\n  "tags": ["developer"]\n}';

export const JsonJavaConverter: React.FC = () => {
  const [direction, setDirection] = useState<'json' | 'java'>('json');
  const [input, setInput] = useState('');
  const [rootName, setRootName] = useState('RootDto');
  let output = '';
  let error = '';
  if (input.trim()) {
    try {
      output = direction === 'json' ? jsonToJava(input, rootName.trim() || 'RootDto') : javaToJson(input, rootName);
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'Unable to convert input.';
    }
  }
  const changeDirection = (next: 'json' | 'java') => {
    if (next === direction) return;
    setInput(output || '');
    setRootName(next === 'json' ? rootName || 'RootDto' : '');
    setDirection(next);
  };
  return (
    <div className="flex-1 flex flex-col h-full space-y-3 min-h-[540px]">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <div className="flex flex-wrap gap-2">
          {(['json', 'java'] as const).map(mode => (
            <button key={mode} type="button" onClick={() => changeDirection(mode)} aria-pressed={direction === mode}
              className={`btn-3d px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${direction === mode ? 'btn-3d-active' : 'text-[var(--text-secondary)]'}`}>
              {mode === 'json' ? 'JSON → Java DTO' : 'Java DTO → JSON'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => { setInput(direction === 'json' ? example : jsonToJava(example)); setRootName(direction === 'json' ? 'RootDto' : ''); }} className="btn-3d px-3 py-1.5 rounded-lg text-xs cursor-pointer">Example</button>
          <button type="button" onClick={() => setInput('')} className="btn-3d px-3 py-1.5 rounded-lg text-xs cursor-pointer">Clear</button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
        <label htmlFor="java-dto-root">{direction === 'json' ? 'Class name' : 'Root class'}</label>
        <TextInput id="java-dto-root" value={rootName} onChange={e => setRootName(e.target.value)} placeholder={direction === 'java' ? 'First class by default' : 'RootDto'} className="input-3d px-2.5 py-1.5 rounded-lg" />
        <span>{direction === 'json' ? 'Public fields, nested classes, and List collections. Renamed keys use Jackson @JsonProperty.' : 'Sample JSON from fields or record components. Unknown types and circular references become null; inherited fields are omitted.'}</span>
      </div>
      {error && <div role="alert" className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 text-rose-500 text-xs">{error}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-[460px]">
        <CodeEditor label={direction === 'json' ? 'JSON Input' : 'Java DTO Input'} language={direction === 'json' ? 'json' : 'java'} value={input} onChange={setInput} placeholder={direction === 'json' ? 'Paste a JSON object...' : 'Paste Java classes or records...'} />
        <CodeEditor label={direction === 'json' ? 'Generated Java DTO' : 'Generated Sample JSON'} language={direction === 'json' ? 'java' : 'json'} value={output} readOnly placeholder="Converted output appears automatically..." />
      </div>
    </div>
  );
};
