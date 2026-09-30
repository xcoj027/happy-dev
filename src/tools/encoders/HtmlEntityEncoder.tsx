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

export const HtmlEntityEncoder: React.FC = () => {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('');

  const encodeHtml = (str: string) => {
    return str.replace(/[&<>"']/g, (m) => {
      switch (m) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#39;';
        default: return m;
      }
    });
  };

  const decodeHtml = (str: string) => {
    const doc = new DOMParser().parseFromString(str, 'text/html');
    return doc.documentElement.textContent || '';
  };

  const output = mode === 'encode' ? encodeHtml(input) : decodeHtml(input);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-gray-900/60 rounded-xl border border-gray-800">
        <button
          type="button"
          onClick={() => setMode('encode')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            mode === 'encode'
              ? 'bg-emerald-500 text-gray-950 font-semibold'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          HTML → Entities (Escape)
        </button>
        <button
          type="button"
          onClick={() => setMode('decode')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            mode === 'decode'
              ? 'bg-emerald-500 text-gray-950 font-semibold'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Entities → HTML (Unescape)
        </button>
        <button
          type="button"
          onClick={() => {
            if (output) {
              setInput(output);
              setMode(mode === 'encode' ? 'decode' : 'encode');
            }
          }}
          className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
          title="Swap"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeEditor
          label={mode === 'encode' ? 'Raw HTML Text' : 'HTML Entities Input'}
          value={input}
          onChange={setInput}
        />
        <CodeEditor
          label={mode === 'encode' ? 'Encoded Entities Output' : 'Unescaped Text Output'}
          value={output}
          readOnly
        />
      </div>
    </div>
  );
};
