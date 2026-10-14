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
import { RefreshCw } from 'lucide-react';

export const PasswordGenerator: React.FC = () => {
  const [length, setLength] = useState(24);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(true);
  const [password, setPassword] = useState('');

  const generateSinglePassword = (len: number) => {
    let chars = '';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    if (includeUpper) chars += upper;
    if (includeLower) chars += lower;
    if (includeNumbers) chars += numbers;
    if (includeSymbols) chars += symbols;

    if (excludeAmbiguous) {
      chars = chars.replace(/[il1Lo0O]/g, '');
    }

    if (!chars) return '';

    const randomValues = new Uint32Array(len);
    window.crypto.getRandomValues(randomValues);

    let res = '';
    for (let i = 0; i < len; i++) {
      res += chars[randomValues[i] % chars.length];
    }
    return res;
  };

  const generate = () => {
    const main = generateSinglePassword(length);
    setPassword(main);
  };

  React.useEffect(() => {
    generate();
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols, excludeAmbiguous]);

  // Calculate entropy bits
  let poolSize = 0;
  if (includeUpper) poolSize += 26;
  if (includeLower) poolSize += 26;
  if (includeNumbers) poolSize += 10;
  if (includeSymbols) poolSize += 30;
  if (excludeAmbiguous) poolSize -= 8;
  if (poolSize <= 0) poolSize = 1;

  const entropy = Math.round(length * Math.log2(poolSize));

  const getStrength = (bits: number) => {
    if (bits < 40) return { label: 'Weak', className: 'bg-rose-50 border border-rose-200 text-rose-700' };
    if (bits < 60) return { label: 'Moderate', className: 'bg-amber-50 border border-amber-200 text-amber-800' };
    if (bits < 90) return { label: 'Strong', className: 'bg-emerald-50 border border-emerald-200 text-emerald-800' };
    return { label: 'Very Strong / Military-Grade', className: 'bg-sky-50 border border-sky-200 text-sky-800' };
  };

  const strength = getStrength(entropy);

  return (
    <div className="space-y-4">
      {/* Main Password Display */}
      <div className="p-4 card-3d rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--text-primary)]">Primary Generated Secret</span>
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full ${strength.className}`}>
              {entropy} bits ({strength.label})
            </span>
            <button
              onClick={generate}
              className="btn-3d p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
              title="Regenerate"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 well-3d rounded-xl">
          <span className="font-mono text-base text-emerald-700 font-bold tracking-wider break-all select-all pr-2">
            {password || 'Select at least one character set'}
          </span>
          <CopyButton text={password} label="Copy" />
        </div>
      </div>

      {/* Options */}
      <div className="p-4 card-3d rounded-xl space-y-4">
        <div>
          <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1.5">
            <span>Password Length</span>
            <span className="font-mono font-bold text-emerald-700">{length} characters</span>
          </div>
          <input
            type="range"
            min="6"
            max="128"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-[var(--text-secondary)]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeUpper}
              onChange={(e) => setIncludeUpper(e.target.checked)}
              className="rounded accent-emerald-500"
            />
            <span>Uppercase (A-Z)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeLower}
              onChange={(e) => setIncludeLower(e.target.checked)}
              className="rounded accent-emerald-500"
            />
            <span>Lowercase (a-z)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              className="rounded accent-emerald-500"
            />
            <span>Numbers (0-9)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeSymbols}
              onChange={(e) => setIncludeSymbols(e.target.checked)}
              className="rounded accent-emerald-500"
            />
            <span>Symbols (!@#$%)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer col-span-2">
            <input
              type="checkbox"
              checked={excludeAmbiguous}
              onChange={(e) => setExcludeAmbiguous(e.target.checked)}
              className="rounded accent-emerald-500"
            />
            <span>Exclude Ambiguous (0, O, 1, l, I)</span>
          </label>
        </div>
      </div>
    </div>
  );
};
