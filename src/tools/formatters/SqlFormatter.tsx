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
import { format } from 'sql-formatter';
import { CodeEditor } from '../../components/common/CodeEditor';
import { Database, AlertCircle } from 'lucide-react';

export const SqlFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState<'sql' | 'postgresql' | 'mysql' | 'sqlite' | 'tsql'>('postgresql');
  const [keywordCase, setKeywordCase] = useState<'upper' | 'lower' | 'preserve'>('upper');
  const [indent, setIndent] = useState(2);
  const [error, setError] = useState<string | null>(null);

  const MAX_SQL_LENGTH = 500000;

  let formattedSql = '';
  try {
    const trimmed = input.trim();
    if (trimmed.length > MAX_SQL_LENGTH) {
      setError(`SQL query exceeds maximum supported length (${MAX_SQL_LENGTH.toLocaleString()} characters)`);
    } else if (trimmed) {
      formattedSql = format(trimmed, {
        language,
        tabWidth: indent,
        keywordCase,
        linesBetweenQueries: 2,
      });
      if (error) setError(null);
    } else {
      if (error) setError(null);
    }
  } catch (err: any) {
    formattedSql = '';
    if (input.trim() && (!error || error !== err.message)) {
      setError(err.message || 'SQL formatting failed');
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full space-y-3 min-h-[540px]">
      {/* Settings Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 card-3d rounded-xl">
        <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
          <Database className="w-4 h-4 text-emerald-600" />
          <label className="flex items-center gap-1.5">
            <span>Dialect:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="input-3d rounded px-2.5 py-1 text-xs outline-none uppercase font-semibold text-[var(--text-primary)]"
            >
              <option value="postgresql">PostgreSQL</option>
              <option value="mysql">MySQL</option>
              <option value="sql">Standard SQL</option>
              <option value="sqlite">SQLite</option>
              <option value="tsql">T-SQL (SQL Server)</option>
            </select>
          </label>

          <label className="flex items-center gap-1.5">
            <span>Keywords:</span>
            <select
              value={keywordCase}
              onChange={(e) => setKeywordCase(e.target.value as any)}
              className="input-3d rounded px-2.5 py-1 text-xs outline-none text-[var(--text-primary)]"
            >
              <option value="upper">UPPERCASE</option>
              <option value="lower">lowercase</option>
              <option value="preserve">Preserve</option>
            </select>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
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

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 h-full min-h-[500px]">
        <CodeEditor
          label="Raw SQL Query"
          value={input}
          onChange={setInput}
          language="sql"
        />
        <CodeEditor
          label="Beautified SQL Query"
          value={formattedSql}
          readOnly
          language="sql"
        />
      </div>
    </div>
  );
};
