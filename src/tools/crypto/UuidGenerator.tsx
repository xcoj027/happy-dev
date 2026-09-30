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
import { CopyButton } from '../../components/common/CopyButton';
import { RefreshCw, CheckCircle2, XCircle, Hash } from 'lucide-react';

export const UuidGenerator: React.FC = () => {
  const [version, setVersion] = useState<'v4' | 'v7' | 'nanoid' | 'ulid'>('v4');
  const [count, setCount] = useState(10);
  const [hyphens, setHyphens] = useState(true);
  const [uppercase, setUppercase] = useState(false);
  const [list, setList] = useState<string[]>([]);
  const [validateInput, setValidateInput] = useState('');

  // UUID v4 generator
  const genV4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  // UUID v7 generator (Unix timestamp ms + random)
  const genV7 = () => {
    const timestamp = Date.now();
    const timeHex = timestamp.toString(16).padStart(12, '0');
    const randomBytes = new Uint8Array(10);
    window.crypto.getRandomValues(randomBytes);

    let hex = timeHex;
    for (let i = 0; i < randomBytes.length; i++) {
      hex += randomBytes[i].toString(16).padStart(2, '0');
    }
    // format as 8-4-4-4-12 with version 7 and variant 2
    const p1 = hex.slice(0, 8);
    const p2 = hex.slice(8, 12);
    const p3 = '7' + hex.slice(13, 16);
    const p4 = ((parseInt(hex.slice(16, 18), 16) & 0x3f) | 0x80).toString(16) + hex.slice(18, 20);
    const p5 = hex.slice(20, 32);
    return `${p1}-${p2}-${p3}-${p4}-${p5}`;
  };

  // NanoID generator
  const genNanoId = (size = 21) => {
    const urlAlphabet = 'useandom-26T198340STOpaiy57hirej_zcbkfgmqvwxlPQREAKJNLVWXYZ';
    let id = '';
    const bytes = new Uint8Array(size);
    window.crypto.getRandomValues(bytes);
    for (let i = 0; i < size; i++) {
      id += urlAlphabet[bytes[i] & 63];
    }
    return id;
  };

  // ULID generator (Crockford's Base32)
  const genUlid = () => {
    const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
    const now = Date.now();
    let time = '';
    let tempTime = now;
    for (let i = 9; i >= 0; i--) {
      time = ENCODING[tempTime % 32] + time;
      tempTime = Math.floor(tempTime / 32);
    }
    let rand = '';
    const randBytes = new Uint8Array(16);
    window.crypto.getRandomValues(randBytes);
    for (let i = 0; i < 16; i++) {
      rand += ENCODING[randBytes[i] % 32];
    }
    return time + rand;
  };

  const generate = () => {
    const results: string[] = [];
    for (let i = 0; i < count; i++) {
      let id = '';
      if (version === 'v4') id = genV4();
      else if (version === 'v7') id = genV7();
      else if (version === 'nanoid') id = genNanoId();
      else if (version === 'ulid') id = genUlid();

      if ((version === 'v4' || version === 'v7') && !hyphens) {
        id = id.replace(/-/g, '');
      }
      if (uppercase) id = id.toUpperCase();
      else if (version === 'v4' || version === 'v7') id = id.toLowerCase();

      results.push(id);
    }
    setList(results);
  };

  React.useEffect(() => {
    generate();
  }, [version, count, hyphens, uppercase]);

  // Validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const isValidUuid = uuidRegex.test(validateInput.trim());

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 card-3d rounded-xl">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[var(--text-muted)] mr-1">Type:</span>
          {(['v4', 'v7', 'nanoid', 'ulid'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setVersion(t)}
              className={`px-3 py-1.5 rounded-lg font-medium transition uppercase text-[11px] cursor-pointer ${
                version === t
                  ? 'btn-3d-active'
                  : 'btn-3d text-[var(--text-secondary)]'
              }`}
            >
              {t === 'v4' ? 'UUID v4' : t === 'v7' ? 'UUID v7 (Time-Ordered)' : t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
          <label className="flex items-center gap-1.5">
            <span>Quantity:</span>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="bg-[var(--control-input-bg)] border border-black/10 dark:border-white/10 rounded px-2 py-1 text-xs text-[var(--text-primary)] outline-none"
            >
              <option value={1}>1</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </label>

          {(version === 'v4' || version === 'v7') && (
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hyphens}
                onChange={(e) => setHyphens(e.target.checked)}
                className="rounded accent-emerald-500"
              />
              <span>Hyphens</span>
            </label>
          )}

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded accent-emerald-500"
            />
            <span>Uppercase</span>
          </label>

          <button
            onClick={generate}
            className="btn-3d p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
            title="Regenerate"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Generated List */}
      <div className="p-4 card-3d rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[var(--text-primary)]">Generated Identifiers ({list.length})</span>
          <CopyButton text={list.join('\n')} label="Copy All" />
        </div>
        <div className="space-y-1.5 max-h-[300px] overflow-auto">
          {list.map((id, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-3 py-1.5 well-3d rounded-lg text-xs font-mono"
            >
              <span className="text-emerald-600 dark:text-emerald-400 select-all font-semibold">{id}</span>
              <CopyButton text={id} />
            </div>
          ))}
        </div>
      </div>

      {/* UUID Validator */}
      <div className="p-4 card-3d rounded-xl space-y-2">
        <span className="text-xs font-semibold text-[var(--text-primary)]">Validate UUID Format</span>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={validateInput}
            onChange={(e) => setValidateInput(e.target.value)}
            placeholder="Paste UUID to validate (e.g. 123e4567-e89b-12d3-a456-426614174000)..."
            className="flex-1 bg-[var(--control-input-bg)] border border-black/10 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-[var(--text-primary)] outline-none focus:border-emerald-500"
          />
          {validateInput.trim() && (
            <div className="flex items-center gap-1.5 text-xs font-mono">
              {isValidUuid ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold"><CheckCircle2 className="w-4 h-4" /> Valid UUID</span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1 font-semibold"><XCircle className="w-4 h-4" /> Invalid UUID</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
