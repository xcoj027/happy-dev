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

import { TextInput } from '../../components/common/TextInput';
import React, { useState } from 'react';
import { CopyButton } from '../../components/common/CopyButton';
import { Binary, AlertCircle } from 'lucide-react';

export const NumberBaseConverter: React.FC = () => {
  const [decVal, setDecVal] = useState('1024');
  const [error, setError] = useState<string | null>(null);

  // BigInt based conversion
  let bin = '';
  let oct = '';
  let dec = '';
  let hex = '';

  try {
    const cleanDec = decVal.trim();
    if (cleanDec) {
      const n = BigInt(cleanDec);
      bin = n.toString(2);
      oct = n.toString(8);
      dec = n.toString(10);
      hex = n.toString(16).toUpperCase();
    }
  } catch {
    // handled by input validation
  }

  const handleUpdate = (val: string, radix: number) => {
    try {
      let clean = val.trim().replace(/[\s_]/g, '');
      if (!clean) {
        setDecVal('');
        setError(null);
        return;
      }
      if (clean.length > 5000) {
        setError('Input exceeds maximum supported character length (5000)');
        return;
      }

      let n: bigint;
      if (radix === 16) {
        if (clean.startsWith('0x') || clean.startsWith('0X')) clean = clean.slice(2);
        if (!clean) {
          setDecVal('');
          return;
        }
        n = BigInt('0x' + clean);
      } else if (radix === 2) {
        if (clean.startsWith('0b') || clean.startsWith('0B')) clean = clean.slice(2);
        if (!clean) {
          setDecVal('');
          return;
        }
        n = BigInt('0b' + clean);
      } else if (radix === 8) {
        if (clean.startsWith('0o') || clean.startsWith('0O')) clean = clean.slice(2);
        if (!clean) {
          setDecVal('');
          return;
        }
        n = BigInt('0o' + clean);
      } else {
        n = BigInt(clean);
      }
      setDecVal(n.toString(10));
      setError(null);
    } catch {
      setError(`Invalid base ${radix} value`);
    }
  };

  // Group binary string into 4-bit nibbles for readability
  const formattedBinary = bin
    ? bin
        .padStart(Math.ceil(bin.length / 4) * 4, '0')
        .match(/.{1,4}/g)
        ?.join(' ') || bin
    : '';

  return (
    <div className="space-y-4">
      <div className="p-4 card-3d rounded-xl space-y-4">
        <div className="flex items-center justify-between text-sm font-semibold text-[var(--text-primary)]">
          <div className="flex items-center gap-2">
            <Binary className="w-4 h-4 text-emerald-500" />
            <span>Arbitrary Precision Number Base Converter</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setDecVal('');
              setError(null);
            }}
            className="text-xs text-[var(--text-muted)] hover:text-rose-500 transition cursor-pointer"
          >
            Clear
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 text-xs rounded-xl font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Decimal */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Decimal (Base 10)</span>
              <CopyButton text={dec} />
            </div>
            <TextInput
              type="text"
              value={dec}
              onChange={(e) => handleUpdate(e.target.value, 10)}
              className="input-3d w-full px-3 py-2 text-sm font-mono text-[var(--text-primary)] outline-none rounded-lg"
              placeholder="e.g. 1024"
            />
          </div>

          {/* Hexadecimal */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span className="font-semibold text-cyan-600 dark:text-cyan-400">Hexadecimal (Base 16)</span>
              <CopyButton text={hex ? `0x${hex}` : ''} />
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs text-[var(--text-muted)] font-mono pointer-events-none">0x</span>
              <TextInput
                type="text"
                value={hex}
                onChange={(e) => handleUpdate(e.target.value, 16)}
                className="input-3d w-full pl-8 pr-3 py-2 text-sm font-mono text-[var(--text-primary)] outline-none uppercase rounded-lg"
                placeholder="e.g. 400"
              />
            </div>
          </div>

          {/* Binary */}
          <div className="space-y-1.5 md:col-span-2">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">Binary (Base 2)</span>
              <CopyButton text={bin} />
            </div>
            <TextInput
              type="text"
              value={bin}
              onChange={(e) => handleUpdate(e.target.value, 2)}
              className="input-3d w-full px-3 py-2 text-sm font-mono text-[var(--text-primary)] outline-none rounded-lg"
              placeholder="e.g. 10000000000"
            />
            {formattedBinary && (
              <p className="text-[11px] text-[var(--text-muted)] font-mono tracking-wider">
                Grouped: {formattedBinary} ({bin.length} bits)
              </p>
            )}
          </div>

          {/* Octal */}
          <div className="space-y-1.5 md:col-span-2">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span className="font-semibold text-amber-600 dark:text-amber-400">Octal (Base 8)</span>
              <CopyButton text={oct ? `0o${oct}` : ''} />
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs text-[var(--text-muted)] font-mono pointer-events-none">0o</span>
              <TextInput
                type="text"
                value={oct}
                onChange={(e) => handleUpdate(e.target.value, 8)}
                className="input-3d w-full pl-8 pr-3 py-2 text-sm font-mono text-[var(--text-primary)] outline-none rounded-lg"
                placeholder="e.g. 2000"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
