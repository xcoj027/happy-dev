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
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const YamlFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [indent, setIndent] = useState(2);
  const [error, setError] = useState<string | null>(null);

  let formattedOutput = '';
  try {
    if (input.trim()) {
      const parsed = YAML.parse(input);
      formattedOutput = YAML.stringify(parsed, { indent });
    }
    if (error) setError(null);
  } catch (err: any) {
    formattedOutput = '';
    if (input.trim() && (!error || error !== err.message)) {
      setError(err.message || 'YAML parsing error');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-900/60 rounded-xl border border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">YAML Document Validator & Beautifier</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-300">
          <label className="flex items-center gap-1.5">
            <span>Indent:</span>
            <select
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 outline-none"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
            </select>
          </label>
        </div>
      </div>

      {input.trim() && error ? (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : input.trim() && !error ? (
        <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Valid YAML syntax</span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeEditor
          label="YAML Input"
          value={input}
          onChange={setInput}
          language="yaml"
        />
        <CodeEditor
          label="Beautified YAML Output"
          value={formattedOutput}
          readOnly
          language="yaml"
        />
      </div>
    </div>
  );
};
