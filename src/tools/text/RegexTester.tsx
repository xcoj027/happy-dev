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
import { AlertCircle } from 'lucide-react';

export const RegexTester: React.FC = () => {
  const [pattern, setPattern] = useState('[A-Za-z0-9_]+');
  const [flags, setFlags] = useState({ g: true, i: true, m: false, s: false });
  const [testText, setTestText] = useState('HappyDev - 38+ modern offline developer utilities (built in 2026).');

  const flagStr = Object.entries(flags)
    .filter(([_, active]) => active)
    .map(([f]) => f)
    .join('');

  let regex: RegExp | null = null;
  let matches: any[] = [];
  let error: string | null = null;
  let hitLimit = false;

  try {
    if (pattern) {
      regex = new RegExp(pattern, flagStr);
      if (flags.g) {
        let match: RegExpExecArray | null;
        let count = 0;
        const maxMatches = 500;
        while ((match = regex.exec(testText)) !== null) {
          matches.push({
            full: match[0],
            index: match.index,
            groups: match.slice(1),
          });
          if (++count >= maxMatches) {
            hitLimit = true;
            break;
          }
          if (match.index === regex.lastIndex) {
            regex.lastIndex++; // prevent infinite loop on zero-width match
          }
        }
      } else {
        const match = regex.exec(testText);
        if (match) {
          matches.push({
            full: match[0],
            index: match.index,
            groups: match.slice(1),
          });
        }
      }
    }
  } catch (err: any) {
    error = err.message || 'Invalid regular expression';
  }

  return (
    <div className="space-y-4">
      {/* Pattern Input and Flags */}
      <div className="p-4 card-3d rounded-xl space-y-3">
        <label className="text-xs text-[var(--text-secondary)] font-medium">Regular Expression Pattern</label>
        <div className="flex items-center gap-2">
          <span className="text-emerald-500 font-mono text-base font-bold">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="input-3d flex-1 px-3 py-2 text-sm font-mono text-emerald-600 dark:text-emerald-400 outline-none rounded-lg font-medium"
            placeholder="Type regex pattern..."
          />
          <span className="text-emerald-500 font-mono text-base font-bold">/{flagStr}</span>
        </div>

        {/* Flag toggles */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[var(--text-secondary)]">
          <span className="text-[var(--text-muted)] font-medium">Flags:</span>
          {(['g', 'i', 'm', 's'] as const).map((flag) => (
            <label key={flag} className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={flags[flag]}
                onChange={(e) => setFlags({ ...flags, [flag]: e.target.checked })}
                className="rounded accent-emerald-500"
              />
              <span className="font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400">{flag}</span>
              <span className="text-[var(--text-muted)]">
                {flag === 'g' ? '(global)' : flag === 'i' ? '(ignore case)' : flag === 'm' ? '(multiline)' : '(dotAll)'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 dark:text-rose-400 text-xs font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="flex items-center justify-between p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-mono font-medium">
          <span>Found {matches.length} match{matches.length === 1 ? '' : 'es'}{hitLimit ? ' (Capped at 500 for safety)' : ''}</span>
        </div>
      )}

      {/* Test String */}
      <CodeEditor
        label="Test String / Input Document"
        value={testText}
        onChange={setTestText}
        minHeight="140px"
      />

      {/* Matches Breakdown */}
      {matches.length > 0 && (
        <div className="p-4 card-3d rounded-xl space-y-2">
          <span className="text-xs font-semibold text-[var(--text-primary)]">Matches & Capture Groups</span>
          <div className="space-y-2 max-h-[260px] overflow-auto">
            {matches.map((m, idx) => (
              <div
                key={idx}
                className="p-3 well-3d rounded-lg text-xs font-mono space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    Match #{idx + 1} (Index: {m.index})
                  </span>
                  <CopyButton text={m.full} />
                </div>
                <div className="text-[var(--text-primary)] bg-[var(--control-panel-bg)] p-1.5 rounded select-all break-all">{m.full}</div>
                {m.groups.length > 0 && (
                  <div className="text-[var(--text-secondary)] pl-2 space-y-0.5 border-l-2 border-emerald-500/30">
                    {m.groups.map((g: string, gIdx: number) => (
                      <div key={gIdx} className="text-[11px]">
                        <span className="text-cyan-600 dark:text-cyan-400 font-semibold">Group ${gIdx + 1}:</span> {g}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
