/**
 * HappyDev - Offline Developer Utilities Suite
 *
 * @author   TNQSW
 * @license  MIT (with Trademark Retention Notice)
 * @repo     https://github.com/xcoj027/happy-dev
 *
 * Copyright (c) 2026 TNQSW. All rights reserved.
 *
 * Trademark Notice:
 * Any derivative work, fork, modification, or redistribution of this software
 * must retain the original "TNQ" trademark, author credits, and notices of TNQSW.
 */

import { TextInput } from '../../components/common/TextInput';
import React, { useState } from 'react';
import { CodeEditor } from '../../components/common/CodeEditor';
import { AlertCircle, Filter } from 'lucide-react';

export const JsonFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [indent, setIndent] = useState(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [queryPath, setQueryPath] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Deep sort object keys helper
  const deepSort = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(deepSort);
    } else if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj)
        .sort()
        .reduce((acc: any, key) => {
          acc[key] = deepSort(obj[key]);
          return acc;
        }, {});
    }
    return obj;
  };

  let formattedOutput = '';
  try {
    if (input.trim()) {
      let parsed = JSON.parse(input);

      // Simple key path filter if specified (e.g. settings.theme or contributors.0.name)
      if (queryPath.trim()) {
        const parts = queryPath.trim().split('.');
        let current = parsed;
        for (const p of parts) {
          if (current !== undefined && current !== null) {
            current = current[p];
          } else {
            current = undefined;
            break;
          }
        }
        parsed = current;
      }

      if (sortKeys && parsed && typeof parsed === 'object') {
        parsed = deepSort(parsed);
      }

      formattedOutput = JSON.stringify(parsed, null, indent);
    }
    if (error) setError(null);
  } catch (err: any) {
    formattedOutput = '';
    if (input.trim() && (!error || error !== err.message)) {
      setError(err.message || 'JSON Parse Error');
    }
  }

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed));
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full space-y-3 min-h-[540px]">
      {/* Controls Bar - Streamlined with 3D buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIndent(2)}
            className={`btn-3d px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              indent === 2 ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
            }`}
          >
            Prettify (2 Spaces)
          </button>
          <button
            type="button"
            onClick={() => setIndent(4)}
            className={`btn-3d px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              indent === 4 ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
            }`}
          >
            Prettify (4 Spaces)
          </button>
          <button
            type="button"
            onClick={handleMinify}
            className="btn-3d px-3.5 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] transition cursor-pointer"
          >
            Minify (1 Line)
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={sortKeys}
              onChange={(e) => setSortKeys(e.target.checked)}
              className="rounded bg-[var(--control-input-bg)] border border-[var(--control-input-border)] text-emerald-500"
            />
            <span>Sort Object Keys (A-Z)</span>
          </label>
        </div>
      </div>

      {/* JSON Path query filter */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--control-panel-bg)] border border-[var(--border-color)]">
        <Filter className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap">Filter Path:</span>
        <TextInput
          type="text"
          value={queryPath}
          onChange={(e) => setQueryPath(e.target.value)}
          placeholder="e.g. settings.theme or contributors.0.name (leave empty for full document)"
          className="flex-1 bg-transparent text-xs font-mono text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
        />
        {queryPath && (
          <button
            onClick={() => setQueryPath('')}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] px-2 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeEditor
          label="JSON Input"
          value={input}
          onChange={setInput}
          language="json"
        />
        <CodeEditor
          label="Formatted / Filtered JSON"
          value={formattedOutput}
          readOnly
          language="json"
        />
      </div>
    </div>
  );
};
