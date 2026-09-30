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
import { Regex, AlertCircle, CheckCircle2 } from 'lucide-react';

export const RegexTester: React.FC = () => {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState({ g: true, i: true, m: false, s: false });
  const [testText, setTestText] = useState('');

  const flagStr = Object.entries(flags)
    .filter(([_, active]) => active)
    .map(([f]) => f)
    .join('');

  let regex: RegExp | null = null;
  let matches: any[] = [];
  let error: string | null = null;

  try {
    if (pattern) {
      regex = new RegExp(pattern, flagStr);
      if (flags.g) {
        let match;
        while ((match = regex.exec(testText)) !== null) {
          matches.push({
            full: match[0],
            index: match.index,
            groups: match.slice(1),
          });
          if (match.index === regex.lastIndex) regex.lastIndex++; // prevent infinite loops
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
      <div className="p-4 bg-gray-900/60 rounded-xl border border-gray-800 space-y-3">
        <label className="text-xs text-gray-400 font-medium">Regular Expression Pattern</label>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-mono text-base font-bold">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm font-mono text-emerald-300 outline-none focus:border-emerald-500 font-medium"
            placeholder="Type regex pattern..."
          />
          <span className="text-emerald-400 font-mono text-base font-bold">/{flagStr}</span>
        </div>

        {/* Flag toggles */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-gray-300">
          <span className="text-gray-500">Flags:</span>
          {(['g', 'i', 'm', 's'] as const).map((flag) => (
            <label key={flag} className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={flags[flag]}
                onChange={(e) => setFlags({ ...flags, [flag]: e.target.checked })}
                className="rounded bg-gray-800 border-gray-700 text-emerald-500"
              />
              <span className="font-mono uppercase font-bold text-emerald-400">{flag}</span>
              <span className="text-gray-500">
                {flag === 'g' ? '(global)' : flag === 'i' ? '(ignore case)' : flag === 'm' ? '(multiline)' : '(dotAll)'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="flex items-center justify-between p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-mono">
          <span>Found {matches.length} match{matches.length === 1 ? '' : 'es'}</span>
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
        <div className="p-4 bg-gray-900/60 rounded-xl border border-gray-800 space-y-2">
          <span className="text-xs font-semibold text-gray-300">Matches & Capture Groups</span>
          <div className="space-y-2 max-h-[260px] overflow-auto">
            {matches.map((m, idx) => (
              <div
                key={idx}
                className="p-3 bg-gray-950/80 rounded-lg border border-gray-800 text-xs font-mono space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-bold">
                    Match #{idx + 1} (Index: {m.index})
                  </span>
                  <CopyButton text={m.full} />
                </div>
                <div className="text-gray-200 bg-gray-900/80 p-1.5 rounded">{m.full}</div>
                {m.groups.length > 0 && (
                  <div className="text-gray-400 pl-2 space-y-0.5 border-l-2 border-emerald-500/30">
                    {m.groups.map((g: string, gIdx: number) => (
                      <div key={gIdx} className="text-[11px]">
                        <span className="text-cyan-400 font-semibold">Group ${gIdx + 1}:</span> {g}
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
