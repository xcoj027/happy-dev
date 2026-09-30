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
import { Binary, Hash, Cpu } from 'lucide-react';

export const NumberBaseConverter: React.FC = () => {
  const [decVal, setDecVal] = useState('');
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
  } catch (err) {
    // handled by input validation
  }

  const handleUpdate = (val: string, radix: number) => {
    try {
      const clean = val.trim();
      if (!clean) {
        setDecVal('');
        setError(null);
        return;
      }
      let n: bigint;
      if (radix === 16) {
        n = BigInt('0x' + clean);
      } else if (radix === 2) {
        n = BigInt('0b' + clean);
      } else if (radix === 8) {
        n = BigInt('0o' + clean);
      } else {
        n = BigInt(clean);
      }
      setDecVal(n.toString(10));
      setError(null);
    } catch (e: any) {
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
      <div className="p-4 bg-gray-900/60 rounded-xl border border-gray-800 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
          <Binary className="w-4 h-4 text-emerald-400" />
          <span>Arbitrary Precision Number Base Converter</span>
        </div>

        {error && (
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-lg font-mono">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Decimal */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-medium text-emerald-400">Decimal (Base 10)</span>
              <CopyButton text={dec} />
            </div>
            <input
              type="text"
              value={dec}
              onChange={(e) => handleUpdate(e.target.value, 10)}
              className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-sm font-mono text-gray-200 focus:border-emerald-500 outline-none"
              placeholder="e.g. 1024"
            />
          </div>

          {/* Hexadecimal */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-medium text-cyan-400">Hexadecimal (Base 16)</span>
              <CopyButton text={hex ? `0x${hex}` : ''} />
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs text-gray-500 font-mono">0x</span>
              <input
                type="text"
                value={hex}
                onChange={(e) => handleUpdate(e.target.value, 16)}
                className="w-full bg-gray-950/80 border border-gray-800 rounded-lg pl-8 pr-3 py-2 text-sm font-mono text-gray-200 focus:border-emerald-500 outline-none uppercase"
                placeholder="e.g. 800"
              />
            </div>
          </div>

          {/* Binary */}
          <div className="space-y-1.5 md:col-span-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-medium text-indigo-400">Binary (Base 2)</span>
              <CopyButton text={bin} />
            </div>
            <input
              type="text"
              value={bin}
              onChange={(e) => handleUpdate(e.target.value, 2)}
              className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-2 text-sm font-mono text-gray-200 focus:border-emerald-500 outline-none"
              placeholder="e.g. 100000000000"
            />
            {formattedBinary && (
              <p className="text-[11px] text-gray-500 font-mono tracking-wider">
                Grouped: {formattedBinary} ({bin.length} bits)
              </p>
            )}
          </div>

          {/* Octal */}
          <div className="space-y-1.5 md:col-span-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-medium text-amber-400">Octal (Base 8)</span>
              <CopyButton text={oct} />
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs text-gray-500 font-mono">0o</span>
              <input
                type="text"
                value={oct}
                onChange={(e) => handleUpdate(e.target.value, 8)}
                className="w-full bg-gray-950/80 border border-gray-800 rounded-lg pl-8 pr-3 py-2 text-sm font-mono text-gray-200 focus:border-emerald-500 outline-none"
                placeholder="e.g. 4000"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
