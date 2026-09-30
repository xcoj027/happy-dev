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
import { ArrowLeftRight, Image as ImageIcon, AlertCircle } from 'lucide-react';

export const Base64Converter: React.FC = () => {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('');
  const [urlSafe, setUrlSafe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Encode / Decode logic with Unicode UTF-8 support
  const encodeBase64 = (str: string) => {
    const bytes = new TextEncoder().encode(str);
    const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
    let b64 = btoa(binString);
    if (urlSafe) {
      b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    return b64;
  };

  const decodeBase64 = (b64: string) => {
    let clean = b64.trim();
    if (urlSafe || clean.includes('-') || clean.includes('_')) {
      clean = clean.replace(/-/g, '+').replace(/_/g, '/');
      while (clean.length % 4) clean += '=';
    }
    const binString = atob(clean);
    const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  };

  let output = '';
  try {
    if (mode === 'encode') {
      output = input ? encodeBase64(input) : '';
    } else {
      output = input ? decodeBase64(input) : '';
    }
    if (error) setError(null);
  } catch (err: any) {
    output = '';
    if (!error || error !== err.message) {
      setError(err.message || 'Invalid Base64 sequence');
    }
  }

  // Check if output looks like an image data URL or base64 image
  const isImageBase64 =
    (mode === 'encode' && input.startsWith('data:image/')) ||
    (mode === 'decode' && input.startsWith('data:image/')) ||
    (input.length > 50 && /^[A-Za-z0-9+/=]+$/.test(input.replace(/\s+/g, '')));

  return (
    <div className="space-y-4">
      {/* Mode Bar */}
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
            Text → Base64 (Encode)
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
            Base64 → Text (Decode)
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
            title="Swap and invert"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        <label className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={urlSafe}
            onChange={(e) => setUrlSafe(e.target.checked)}
            className="rounded bg-gray-800 border-gray-700 text-emerald-500 focus:ring-0"
          />
          <span>URL-Safe Base64 (- and _ instead of + and /)</span>
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeEditor
          label={mode === 'encode' ? 'Plain Text String' : 'Base64 Encoded String'}
          value={input}
          onChange={setInput}
        />
        <CodeEditor
          label={mode === 'encode' ? 'Base64 Output' : 'Decoded Plain Text'}
          value={output}
          readOnly
        />
      </div>
    </div>
  );
};
