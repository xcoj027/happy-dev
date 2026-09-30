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
import { CopyButton } from '../../components/common/CopyButton';
import { Globe, Plus, Trash2, ArrowLeftRight } from 'lucide-react';

export const UrlEncoder: React.FC = () => {
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('decode');

  // Parse URL components and query params
  let parsedUrl: URL | null = null;
  const queryParams: { key: string; value: string }[] = [];

  try {
    parsedUrl = new URL(url);
    parsedUrl.searchParams.forEach((value, key) => {
      queryParams.push({ key, value });
    });
  } catch (e) {
    // If not a full URL, parse query string
    if (url.includes('?') || url.includes('=')) {
      const qs = url.split('?')[1] || url;
      const sp = new URLSearchParams(qs);
      sp.forEach((value, key) => {
        queryParams.push({ key, value });
      });
    }
  }

  const encodedFull = encodeURIComponent(url);
  const decodedFull = decodeURIComponent(url);

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
        setUrl(newUrl.toString());
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
        setUrl(newUrl.toString());
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
        setUrl(newUrl.toString());
      } else {
        setUrl(url + (url.includes('?') ? '&' : '?') + 'new_param=value');
      }
    } catch {
      setUrl(url + '?new_param=value');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-900/60 rounded-xl border border-gray-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setUrl(encodeURIComponent(url))}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition"
          >
            Encode URL Component
          </button>
          <button
            type="button"
            onClick={() => setUrl(decodeURIComponent(url))}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition"
          >
            Decode URL
          </button>
        </div>
      </div>

      <CodeEditor
        label="URL or Query String"
        value={url}
        onChange={setUrl}
        minHeight="90px"
      />

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
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition"
          >
            <Plus className="w-3 h-3" /> Add Param
          </button>
        </div>

        {queryParams.length === 0 ? (
          <div className="text-xs text-gray-500 py-3 text-center">
            No query parameters found in this URL.
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
                  className="p-1.5 text-gray-500 hover:text-rose-400 rounded transition"
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
