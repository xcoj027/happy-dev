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

  const diffResult = mode === 'lines' ? Diff.diffLines(orig, modified) : Diff.diffWords(orig, modified);

  return (
    <div className="flex-1 flex flex-col h-full space-y-3 min-h-[540px]">
      <div className="flex items-center justify-between p-3 bg-gray-900/60 rounded-xl border border-gray-800">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-gray-300 font-medium">Text & Code Diff Comparison</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setMode('lines')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              mode === 'lines' ? 'bg-emerald-500 text-gray-950 font-bold' : 'bg-gray-800 text-gray-300'
            }`}
          >
            Diff by Lines
          </button>
          <button
            type="button"
            onClick={() => setMode('words')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              mode === 'words' ? 'bg-emerald-500 text-gray-950 font-bold' : 'bg-gray-800 text-gray-300'
            }`}
          >
            Diff by Words
          </button>
        </div>
      </div>

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
      <div className="p-4 bg-gray-950 rounded-xl border border-gray-800 space-y-2">
        <span className="text-xs font-semibold text-gray-300">Unified Visual Diff</span>
        <div className="p-3 bg-gray-900/90 rounded-lg font-mono text-xs overflow-auto max-h-[350px] leading-relaxed select-text">
          {diffResult.map((part, index) => {
            const color = part.added
              ? 'bg-emerald-500/20 text-emerald-400 border-l-2 border-emerald-500 pl-1'
              : part.removed
              ? 'bg-rose-500/20 text-rose-400 border-l-2 border-rose-500 pl-1 line-through'
              : 'text-gray-400';
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
