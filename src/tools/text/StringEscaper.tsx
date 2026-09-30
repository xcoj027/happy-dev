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
import { CodeEditor } from '../../components/common/CodeEditor';
import { ArrowLeftRight } from 'lucide-react';

export const StringEscaper: React.FC = () => {
  const [lang, setLang] = useState<'json' | 'sql' | 'regex' | 'csharp'>('json');
  const [mode, setMode] = useState<'escape' | 'unescape'>('escape');
  const [input, setInput] = useState('');

  const processString = (str: string, type: string, action: 'escape' | 'unescape') => {
    if (!str) return '';
    try {
      if (action === 'escape') {
        if (type === 'json' || type === 'csharp') {
          return JSON.stringify(str).slice(1, -1);
        }
        if (type === 'sql') {
          return str.replace(/'/g, "''");
        }
        if (type === 'regex') {
          return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
      } else {
        if (type === 'json' || type === 'csharp') {
          return JSON.parse(`"${str.replace(/"/g, '\\"')}"`);
        }
        if (type === 'sql') {
          return str.replace(/''/g, "'");
        }
        if (type === 'regex') {
          return str.replace(/\\([.*+?^${}()|[\]\\])/g, '$1');
        }
      }
    } catch {
      return str;
    }
    return str;
  };

  const output = processString(input, lang, mode);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-900/60 rounded-xl border border-gray-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode('escape')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              mode === 'escape' ? 'bg-emerald-500 text-gray-950 font-bold' : 'bg-gray-800 text-gray-300'
            }`}
          >
            Escape String
          </button>
          <button
            type="button"
            onClick={() => setMode('unescape')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              mode === 'unescape' ? 'bg-emerald-500 text-gray-950 font-bold' : 'bg-gray-800 text-gray-300'
            }`}
          >
            Unescape String
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400">Target Language:</span>
          {(['json', 'sql', 'regex', 'csharp'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setLang(t)}
              className={`px-2.5 py-1 rounded-lg uppercase text-[11px] font-semibold transition ${
                lang === t ? 'bg-cyan-500 text-gray-950' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {t === 'csharp' ? 'C# / Java' : t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeEditor
          label={mode === 'escape' ? 'Unescaped Raw String' : 'Escaped String Input'}
          value={input}
          onChange={setInput}
        />
        <CodeEditor
          label={mode === 'escape' ? 'Escaped String Output' : 'Unescaped Output'}
          value={output}
          readOnly
        />
      </div>
    </div>
  );
};
