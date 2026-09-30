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
import { Globe, Plus, Trash2, AlertCircle } from 'lucide-react';

export const UrlEncoder: React.FC = () => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [encodeFullUri, setEncodeFullUri] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute live output
  let output = '';
  try {
    if (input) {
      if (mode === 'encode') {
        output = encodeFullUri ? encodeURI(input) : encodeURIComponent(input);
      } else {
        output = encodeFullUri ? decodeURI(input) : decodeURIComponent(input);
      }
    }
    if (error) setError(null);
  } catch (err: any) {
    output = '';
    if (!error || error !== err.message) {
      setError(err.message || 'Invalid URI escape sequence');
    }
  }

  // Parse URL components and query params from whichever contains valid URL (input or output)
  const targetUrl = mode === 'encode' ? input : output || input;
  let parsedUrl: URL | null = null;
  const queryParams: { key: string; value: string }[] = [];

  try {
    parsedUrl = new URL(targetUrl);
    parsedUrl.searchParams.forEach((value, key) => {
      queryParams.push({ key, value });
    });
  } catch (e) {
    // If not a full URL, try parsing query string
    if (targetUrl.includes('?') || targetUrl.includes('=')) {
      const qs = targetUrl.split('?')[1] || targetUrl;
      try {
        const sp = new URLSearchParams(qs);
        sp.forEach((value, key) => {
          queryParams.push({ key, value });
        });
      } catch {}
    }
  }

  const updateParam = (index: number, newKey: string, newValue: string) => {
    try {
      if (parsedUrl) {
        const newUrl = new URL(parsedUrl.toString());
        newUrl.search = '';
        queryParams.forEach((p, idx) => {
          if (idx === index) {
            if (newKey) newUrl.searchParams.append(newKey, newValue);
          } else {
            newUrl.searchParams.append(p.key, p.value);
          }
        });
        setInput(newUrl.toString());
      }
    } catch (e) {
      // Fallback
    }
  };

  const removeParam = (index: number) => {
    try {
      if (parsedUrl) {
        const newUrl = new URL(parsedUrl.toString());
        newUrl.search = '';
        queryParams.forEach((p, idx) => {
          if (idx !== index) newUrl.searchParams.append(p.key, p.value);
        });
        setInput(newUrl.toString());
      }
    } catch (e) {
      // Fallback
    }
  };

  const addParam = () => {
    try {
      if (parsedUrl) {
        const newUrl = new URL(parsedUrl.toString());
        newUrl.searchParams.append('new_param', 'value');
        setInput(newUrl.toString());
      } else {
        setInput(input + (input.includes('?') ? '&' : '?') + 'new_param=value');
      }
    } catch {
      setInput(input + '?new_param=value');
    }
  };


  return (
    <div className="space-y-4">
      {/* Mode Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 card-3d rounded-xl">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode('encode')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              mode === 'encode'
                ? 'bg-emerald-600 text-white font-semibold shadow-md'
                : 'btn-3d text-[var(--text-secondary)]'
            }`}
          >
            URL / Text → Encoded (Encode)
          </button>
          <button
            type="button"
            onClick={() => setMode('decode')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              mode === 'decode'
                ? 'bg-emerald-600 text-white font-semibold shadow-md'
                : 'btn-3d text-[var(--text-secondary)]'
            }`}
          >
            Encoded → URL / Text (Decode)
          </button>
        </div>

        <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer">
          <input
            type="checkbox"
            checked={encodeFullUri}
            onChange={(e) => setEncodeFullUri(e.target.checked)}
            className="rounded text-emerald-500 focus:ring-0"
          />
          <span>Full URI Mode ({encodeFullUri ? 'encodeURI' : 'encodeURIComponent'})</span>
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Editor Grid: Input (Text Input) and Output (Result Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeEditor
          label={mode === 'encode' ? 'Raw URL or Query String' : 'Encoded URL String'}
          value={input}
          onChange={setInput}
          placeholder={mode === 'encode' ? 'Enter URL or query string to encode...' : 'Paste %-encoded string to decode...'}
          minHeight="220px"
        />
        <CodeEditor
          label={mode === 'encode' ? 'Encoded URL Result' : 'Decoded URL Result'}
          value={output}
          readOnly
          placeholder={mode === 'encode' ? 'Encoded URL will appear here...' : 'Decoded URL will appear here...'}
          minHeight="220px"
        />
      </div>

      {/* Query Parameters Inspector & Builder */}
      <div className="p-4 card-3d rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            Query Parameters Inspector ({queryParams.length})
          </span>
          <button
            type="button"
            onClick={addParam}
            className="btn-3d inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded text-emerald-600 dark:text-emerald-400 transition cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Add Param
          </button>
        </div>

        {queryParams.length === 0 ? (
          <div className="text-xs text-[var(--text-secondary)] py-3 text-center">
            No query parameters found in the current URL.
          </div>
        ) : (
          <div className="space-y-2">
            {queryParams.map((param, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={param.key}
                  onChange={(e) => updateParam(idx, e.target.value, param.value)}
                  placeholder="Key"
                  className="w-1/3 input-3d rounded px-2.5 py-1.5 text-xs font-mono text-[var(--text-primary)] outline-none"
                />
                <span className="text-[var(--text-secondary)]">=</span>
                <input
                  type="text"
                  value={param.value}
                  onChange={(e) => updateParam(idx, param.key, e.target.value)}
                  placeholder="Value"
                  className="flex-1 input-3d rounded px-2.5 py-1.5 text-xs font-mono text-[var(--text-primary)] outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeParam(idx)}
                  className="p-1.5 text-[var(--text-secondary)] hover:text-rose-600 dark:hover:text-rose-400 rounded transition cursor-pointer"
                  title="Remove parameter"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
