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
import { Globe, Plus, Trash2, ArrowLeftRight, AlertCircle } from 'lucide-react';

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

  const handleSwap = () => {
    if (output) {
      setInput(output);
      setMode(mode === 'encode' ? 'decode' : 'encode');
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-900/60 rounded-xl border border-gray-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode('encode')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              mode === 'encode'
                ? 'bg-emerald-500 text-gray-950 font-semibold'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            URL / Text → Encoded (Encode)
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
            Encoded → URL / Text (Decode)
          </button>
          <button
            type="button"
            onClick={handleSwap}
            disabled={!output}
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-50 transition cursor-pointer"
            title="Swap input and output"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        <label className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={encodeFullUri}
            onChange={(e) => setEncodeFullUri(e.target.checked)}
            className="rounded bg-gray-800 border-gray-700 text-emerald-500 focus:ring-0"
          />
          <span>Full URI Mode ({encodeFullUri ? 'encodeURI' : 'encodeURIComponent'})</span>
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-mono">
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
      <div className="p-4 bg-gray-900/60 rounded-xl border border-gray-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            Query Parameters Inspector ({queryParams.length})
          </span>
          <button
            type="button"
            onClick={addParam}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Add Param
          </button>
        </div>

        {queryParams.length === 0 ? (
          <div className="text-xs text-gray-500 py-3 text-center">
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
                  className="w-1/3 bg-gray-950 border border-gray-800 rounded px-2.5 py-1.5 text-xs font-mono text-emerald-400 outline-none focus:border-emerald-500"
                />
                <span className="text-gray-500">=</span>
                <input
                  type="text"
                  value={param.value}
                  onChange={(e) => updateParam(idx, param.key, e.target.value)}
                  placeholder="Value"
                  className="flex-1 bg-gray-950 border border-gray-800 rounded px-2.5 py-1.5 text-xs font-mono text-gray-200 outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => removeParam(idx)}
                  className="p-1.5 text-gray-500 hover:text-rose-400 rounded transition cursor-pointer"
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
