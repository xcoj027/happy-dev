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
import { AlertCircle } from 'lucide-react';

interface Base64ConverterProps {
  initialMode?: 'encode' | 'decode';
}

export const Base64Converter: React.FC<Base64ConverterProps> = ({ initialMode = 'encode' }) => {
  const [mode, setMode] = useState<'encode' | 'decode'>(initialMode);
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

  return (
    <div className="base64-layout space-y-4 min-w-0">
      {/* Mode Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 card-3d rounded-xl">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode('encode')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              mode === 'encode'
                ? 'bg-emerald-600 text-white font-semibold shadow-md'
                : 'btn-3d text-[var(--text-secondary)]'
            }`}
          >
            Text → Base64 (Encode)
          </button>
          <button
            type="button"
            onClick={() => setMode('decode')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              mode === 'decode'
                ? 'bg-emerald-600 text-white font-semibold shadow-md'
                : 'btn-3d text-[var(--text-secondary)]'
            }`}
          >
            Base64 → Text (Decode)
          </button>
        </div>

        <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer">
          <input
            type="checkbox"
            checked={urlSafe}
            onChange={(e) => setUrlSafe(e.target.checked)}
            className="rounded text-emerald-500 focus:ring-0 cursor-pointer"
          />
          <span>URL-Safe Base64 (- and _ instead of + and /)</span>
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 dark:text-rose-400 text-xs font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Editor Grid */}
      <div className="base64-editors grid grid-cols-1 gap-4">
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
