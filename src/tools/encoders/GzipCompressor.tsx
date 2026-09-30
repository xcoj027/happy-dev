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
import { AlertCircle, Gauge } from 'lucide-react';

export const GzipCompressor: React.FC = () => {
  const [mode, setMode] = useState<'compress' | 'decompress'>('compress');
  const [format, setFormat] = useState<'gzip' | 'deflate'>('gzip');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<{ orig: number; comp: number; ratio: string } | null>(null);

  const handleProcess = async () => {
    setError(null);
    try {
      if (mode === 'compress') {
        const stream = new Blob([input]).stream().pipeThrough(new CompressionStream(format));
        const res = await new Response(stream).arrayBuffer();
        const bytes = new Uint8Array(res);
        const b64 = btoa(Array.from(bytes, b => String.fromCharCode(b)).join(''));
        setOutput(b64);

        const origLen = new TextEncoder().encode(input).length;
        const compLen = bytes.length;
        const ratio = origLen > 0 ? (((origLen - compLen) / origLen) * 100).toFixed(1) : '0';
        setStats({ orig: origLen, comp: compLen, ratio });
      } else {
        const binStr = atob(input.trim());
        const bytes = Uint8Array.from(binStr, c => c.charCodeAt(0));
        const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream(format));
        const text = await new Response(stream).text();
        setOutput(text);
        setStats(null);
      }
    } catch (err: any) {
      setOutput('');
      setError(err.message || 'Compression/Decompression failed. Verify your input format.');
    }
  };

  React.useEffect(() => {
    handleProcess();
  }, [input, mode, format]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-900/60 rounded-xl border border-gray-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode('compress')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              mode === 'compress'
                ? 'bg-emerald-500 text-gray-950 font-semibold'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Compress (Text → Base64)
          </button>
          <button
            type="button"
            onClick={() => setMode('decompress')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              mode === 'decompress'
                ? 'bg-emerald-500 text-gray-950 font-semibold'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Decompress (Base64 → Text)
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-300">
          <label className="flex items-center gap-1.5">
            <span>Algorithm:</span>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 outline-none"
            >
              <option value="gzip">Gzip</option>
              <option value="deflate">Deflate</option>
            </select>
          </label>
        </div>
      </div>

      {stats && mode === 'compress' && (
        <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4" />
            <span>
              Original: <strong className="font-mono">{stats.orig} B</strong> → Compressed:{' '}
              <strong className="font-mono">{stats.comp} B</strong>
            </span>
          </div>
          <span className="font-semibold font-mono">
            {Number(stats.ratio) > 0 ? `Saved ${stats.ratio}%` : 'Expanded due to small payload header'}
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeEditor
          label={mode === 'compress' ? 'Uncompressed Plain Text' : 'Base64 Compressed Data'}
          value={input}
          onChange={setInput}
        />
        <CodeEditor
          label={mode === 'compress' ? 'Base64 Compressed Output' : 'Decompressed Text Output'}
          value={output}
          readOnly
        />
      </div>
    </div>
  );
};
