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

  const MAX_YAML_LENGTH = 500000;

  let formattedOutput = '';
  try {
    const trimmed = input.trim();
    if (trimmed.length > MAX_YAML_LENGTH) {
      setError(`YAML document exceeds maximum supported length (${MAX_YAML_LENGTH.toLocaleString()} characters)`);
    } else if (trimmed) {
      const parsed = YAML.parse(trimmed);
      formattedOutput = YAML.stringify(parsed, { indent });
      if (error) setError(null);
    } else {
      if (error) setError(null);
    }
  } catch (err: any) {
    formattedOutput = '';
    if (input.trim() && (!error || error !== err.message)) {
      setError(err.message || 'YAML parsing error');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 card-3d rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-secondary)]">YAML Document Validator & Beautifier</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
          <label className="flex items-center gap-1.5">
            <span>Indent:</span>
            <select
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
              className="input-3d rounded px-2.5 py-1 text-xs outline-none text-[var(--text-primary)]"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
            </select>
          </label>
        </div>
      </div>

      {input.trim() && error ? (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : input.trim() && !error ? (
        <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-mono">
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
