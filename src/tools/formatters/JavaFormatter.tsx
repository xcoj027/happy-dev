/**
 * HappyDev - Offline Developer Utilities Suite
 * @author TNQSW
 * @license MIT (with Trademark Retention Notice)
 * @repo https://github.com/xcoj027/happy-dev
 * Copyright (c) 2026 TNQSW. All rights reserved.
 * Any derivative work must retain the TNQ trademark, author credits and notices.
 */
import React, { useEffect, useState } from 'react';
import { CodeEditor } from '../../components/common/CodeEditor';

const example = `public class Greeting{private final String name;public Greeting(String name){this.name=name;}public String greet(){return "Hello, "+name;}public static void main(String[] args){System.out.println(new Greeting("HappyDev").greet());}}`;

export const JavaFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [indent, setIndent] = useState('4');
  const [width, setWidth] = useState(100);
  const [result, setResult] = useState({ output: '', error: '', busy: false });

  useEffect(() => {
    let cancelled = false;
    if (!input.trim()) {
      setResult({ output: '', error: '', busy: false });
      return;
    }
    if (input.length > 500000) {
      setResult({ output: '', error: 'Java source exceeds the 500,000 character limit.', busy: false });
      return;
    }
    setResult({ output: '', error: '', busy: true });
    const timer = setTimeout(async () => {
      try {
        const [prettier, { default: java }] = await Promise.all([
          import('prettier/standalone'),
          import('prettier-plugin-java'),
        ]);
        if (cancelled) return;
        const output = await prettier.format(input, {
          parser: 'java', plugins: [java], tabWidth: indent === 'tabs' ? 4 : Number(indent),
          useTabs: indent === 'tabs', printWidth: width,
        });
        if (!cancelled) setResult({ output, error: '', busy: false });
      } catch (cause) {
        if (!cancelled) setResult({ output: '', error: cause instanceof Error ? cause.message : 'Java formatting failed.', busy: false });
      }
    }, 250);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [input, indent, width]);

  return (
    <div className="flex-1 flex flex-col h-full space-y-3 min-h-[540px]">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 card-3d rounded-xl">
        <div className="flex flex-wrap gap-3 text-xs text-[var(--text-secondary)]">
          <label className="flex items-center gap-1.5">Indentation
            <select value={indent} onChange={e => setIndent(e.target.value)} className="input-3d rounded px-2.5 py-1 text-[var(--text-primary)]">
              <option value="2">2 spaces</option><option value="4">4 spaces</option><option value="tabs">Tabs</option>
            </select>
          </label>
          <label className="flex items-center gap-1.5">Line width
            <select value={width} onChange={e => setWidth(Number(e.target.value))} className="input-3d rounded px-2.5 py-1 text-[var(--text-primary)]">
              {[80, 100, 120, 140].map(value => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setInput(example)} className="btn-3d px-3 py-1.5 rounded-lg text-xs cursor-pointer">Example</button>
          <button type="button" onClick={() => setInput('')} className="btn-3d px-3 py-1.5 rounded-lg text-xs cursor-pointer">Clear</button>
        </div>
      </div>
      <p className="text-xs text-[var(--text-muted)]">Paste a complete Java class, record, or source file. Formatting runs locally.</p>
      {result.error && <div role="alert" className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs whitespace-pre-wrap font-mono">{result.error}</div>}
      <div role="status" className="text-xs text-[var(--text-muted)]">{result.busy ? 'Formatting…' : ''}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-[460px]">
        <CodeEditor label="Java Source" language="java" value={input} onChange={setInput} placeholder="Paste Java source here..." />
        <CodeEditor label="Formatted Java" language="java" value={result.output} readOnly placeholder="Formatted Java appears automatically..." />
      </div>
    </div>
  );
};
