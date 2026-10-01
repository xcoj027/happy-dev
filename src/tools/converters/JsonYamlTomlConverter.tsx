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

import React, { useState } from 'react';
import YAML from 'yaml';
import { CodeEditor } from '../../components/common/CodeEditor';
import { AlertCircle } from 'lucide-react';

export const JsonYamlTomlConverter: React.FC = () => {
  const [direction, setDirection] = useState<'json2yaml' | 'yaml2json'>('json2yaml');
  const [input, setInput] = useState('');
  const [indent, setIndent] = useState(2);
  const [error, setError] = useState<string | null>(null);

  let output = '';
  try {
    if (!input.trim()) {
      output = '';
    } else if (direction === 'json2yaml') {
      const parsed = JSON.parse(input);
      output = YAML.stringify(parsed, { indent });
    } else {
      const parsed = YAML.parse(input);
      output = JSON.stringify(parsed, null, indent);
    }
    if (error) setError(null);
  } catch (err: any) {
    output = '';
    if (input.trim() && (!error || error !== err.message)) {
      setError(err.message || 'Syntax error during parsing');
    }
  }


  return (
    <div className="flex-1 flex flex-col h-full space-y-3 min-h-[540px]">
      {/* Controls Bar - Streamlined with 3D buttons, no redundant box */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDirection('json2yaml')}
            className={`btn-3d px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              direction === 'json2yaml' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
            }`}
          >
            JSON → YAML
          </button>
          <button
            type="button"
            onClick={() => setDirection('yaml2json')}
            className={`btn-3d px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              direction === 'yaml2json' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
            }`}
          >
            YAML → JSON
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
          <label className="flex items-center gap-1.5">
            <span>Indent:</span>
            <select
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
              className="bg-[var(--control-input-bg)] border border-[var(--control-input-border)] rounded-lg px-2.5 py-1 text-xs text-[var(--text-primary)] outline-none cursor-pointer"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
            </select>
          </label>
        </div>
      </div>

      {/* Error / Validation Alert */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      )}

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 h-full min-h-[500px]">
        <CodeEditor
          label={direction === 'json2yaml' ? 'JSON Input' : 'YAML Input'}
          value={input}
          onChange={setInput}
          language={direction === 'json2yaml' ? 'json' : 'yaml'}
        />
        <CodeEditor
          label={direction === 'json2yaml' ? 'YAML Output' : 'JSON Output'}
          value={output}
          readOnly
          language={direction === 'json2yaml' ? 'yaml' : 'json'}
        />
      </div>
    </div>
  );
};
