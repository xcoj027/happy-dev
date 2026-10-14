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
import * as Diff from 'diff';
import { CodeEditor } from '../../components/common/CodeEditor';
import { GitCompare } from 'lucide-react';

export const TextDiffChecker: React.FC = () => {
  const [orig, setOrig] = useState('');
  const [modified, setModified] = useState('');
  const [mode, setMode] = useState<'words' | 'lines'>('lines');

  const MAX_DIFF_CHARS = 100000;
  const isTooLarge = orig.length > MAX_DIFF_CHARS || modified.length > MAX_DIFF_CHARS;
  const safeOrig = isTooLarge ? orig.slice(0, MAX_DIFF_CHARS) : orig;
  const safeModified = isTooLarge ? modified.slice(0, MAX_DIFF_CHARS) : modified;

  const diffResult = mode === 'lines' ? Diff.diffLines(safeOrig, safeModified) : Diff.diffWords(safeOrig, safeModified);

  return (
    <div className="flex-1 flex flex-col h-full space-y-3 min-h-[540px]">
      <div className="flex items-center justify-between p-3 card-3d rounded-xl">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-emerald-600" />
          <span className="text-xs text-[var(--text-secondary)] font-medium">Text & Code Diff Comparison</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setMode('lines')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              mode === 'lines' ? 'bg-emerald-600 text-white font-bold shadow-md' : 'btn-3d text-[var(--text-secondary)]'
            }`}
          >
            Diff by Lines
          </button>
          <button
            type="button"
            onClick={() => setMode('words')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              mode === 'words' ? 'bg-emerald-600 text-white font-bold shadow-md' : 'btn-3d text-[var(--text-secondary)]'
            }`}
          >
            Diff by Words
          </button>
        </div>
      </div>

      {isTooLarge && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
          Note: Input exceeds 100,000 characters. To prevent browser freezing, diff is computed on the first 100,000 characters.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 h-full min-h-[350px]">
        <CodeEditor
          label="Original Text (Before)"
          value={orig}
          onChange={setOrig}
        />
        <CodeEditor
          label="Modified Text (After)"
          value={modified}
          onChange={setModified}
        />
      </div>

      {/* Visual Diff Output */}
      <div className="p-4 card-3d rounded-xl space-y-2">
        <span className="text-xs font-semibold text-[var(--text-secondary)]">Unified Visual Diff</span>
        <div className="p-3 well-3d rounded-lg font-mono text-xs overflow-auto max-h-[350px] leading-relaxed select-text">
          {diffResult.map((part, index) => {
            const color = part.added
              ? 'bg-emerald-100 text-emerald-900 border-l-2 border-emerald-500 pl-1 font-semibold'
              : part.removed
              ? 'bg-rose-100 text-rose-900 border-l-2 border-rose-500 pl-1 line-through'
              : 'text-[var(--text-primary)]';
            return (
              <span key={index} className={`${color} whitespace-pre-wrap`}>
                {part.value}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
