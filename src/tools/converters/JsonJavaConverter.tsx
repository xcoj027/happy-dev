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
    <div className="flex-1 flex flex-col h-full space-y-4 min-h-[540px]">
      <div className="card-3d p-4.5 sm:p-5 rounded-2xl flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2.5">
            {(['json', 'java'] as const).map(mode => (
              <button key={mode} type="button" onClick={() => changeDirection(mode)} aria-pressed={direction === mode}
                className={`btn-3d px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition ${direction === mode ? 'btn-3d-active' : 'text-[var(--text-secondary)]'}`}>
                {mode === 'json' ? 'JSON → Java DTO' : 'Java DTO → JSON'}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setInput(direction === 'json' ? example : jsonToJava(example)); setRootName(direction === 'json' ? 'RootDto' : ''); }} className="btn-3d px-3.5 py-2 rounded-xl text-xs font-medium cursor-pointer">Example</button>
            <button type="button" onClick={() => setInput('')} className="btn-3d px-3.5 py-2 rounded-xl text-xs font-medium cursor-pointer">Clear</button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3.5 text-xs text-[var(--text-secondary)] pt-3.5 border-t border-[var(--border-color)]">
          <label htmlFor="java-dto-root" className="font-semibold text-[var(--text-primary)]">{direction === 'json' ? 'Class name:' : 'Root class:'}</label>
          <TextInput id="java-dto-root" value={rootName} onChange={e => setRootName(e.target.value)} placeholder={direction === 'java' ? 'First class by default' : 'RootDto'} className="input-3d px-3.5 py-2 rounded-lg text-xs" />
          <span className="text-[11px] text-[var(--text-muted)]">{direction === 'json' ? 'Public fields, nested classes, and List collections.' : 'Sample JSON from fields or record components.'}</span>
        </div>
      </div>
      {error && <div role="alert" className="px-4 py-3 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-mono">{error}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[460px]">
        <CodeEditor label={direction === 'json' ? 'JSON Input' : 'Java DTO Input'} language={direction === 'json' ? 'json' : 'java'} value={input} onChange={setInput} placeholder={direction === 'json' ? 'Paste a JSON object...' : 'Paste Java classes or records...'} />
        <CodeEditor label={direction === 'json' ? 'Generated Java DTO' : 'Generated Sample JSON'} language={direction === 'json' ? 'java' : 'json'} value={output} readOnly placeholder="Converted output appears automatically..." />
      </div>
    </div>
  );
};
