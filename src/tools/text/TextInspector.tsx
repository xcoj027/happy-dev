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
import { FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const TextInspector: React.FC = () => {
  const [text, setText] = useState('');

  const MAX_ANALYZE_LENGTH = 1000000;
  const isTruncated = text.length > MAX_ANALYZE_LENGTH;
  const textToAnalyze = isTruncated ? text.slice(0, MAX_ANALYZE_LENGTH) : text;

  const charCount = text.length;
  const charNoSpaces = textToAnalyze.replace(/\s/g, '').length;
  const wordCount = textToAnalyze.trim() ? textToAnalyze.trim().split(/\s+/).length : 0;
  const lineCount = text ? text.split('\n').length : 0;
  const paragraphCount = textToAnalyze ? textToAnalyze.split(/\n\s*\n/).filter(Boolean).length : 0;
  const byteCount = new TextEncoder().encode(textToAnalyze).length;
  const readingTimeSec = Math.ceil((wordCount / 200) * 60);

  // Detect zero-width and invisible unicode characters
  const invisibleCharsRegex = /[\u200B-\u200D\uFEFF\u00A0\u200E\u200F\u202A-\u202E]/g;
  const invisibleMatches = textToAnalyze.match(invisibleCharsRegex) || [];

  const handleCleanInvisible = () => {
    setText(text.replace(invisibleCharsRegex, ''));
  };

  return (
    <div className="space-y-4">
      <CodeEditor
        label="Input Text to Analyze"
        value={text}
        onChange={setText}
        minHeight="140px"
      />

      {isTruncated && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-600 dark:text-amber-400">
          Note: Input exceeds 1,000,000 characters. Detailed analysis metrics are calculated on the first 1,000,000 characters for browser performance.
        </div>
      )}

      {/* Invisible Characters Alert */}
      {invisibleMatches.length > 0 ? (
        <div className="flex items-center justify-between p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-600 dark:text-amber-400">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>
              Detected <strong>{invisibleMatches.length}</strong> hidden/zero-width Unicode character{invisibleMatches.length > 1 ? 's' : ''} (e.g. ZWSP, non-breaking space).
            </span>
          </div>
          <button
            type="button"
            onClick={handleCleanInvisible}
            className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 font-semibold transition"
          >
            Strip Hidden Characters
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>No rogue hidden or zero-width Unicode characters found.</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 card-3d rounded-xl space-y-0.5">
          <span className="text-[11px] text-[var(--text-secondary)]">Word Count</span>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{wordCount.toLocaleString()}</div>
        </div>

        <div className="p-3 card-3d rounded-xl space-y-0.5">
          <span className="text-[11px] text-[var(--text-secondary)]">Characters</span>
          <div className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400">{charCount.toLocaleString()}</div>
          <div className="text-[10px] text-[var(--text-secondary)] font-mono">No spaces: {charNoSpaces.toLocaleString()}</div>
        </div>

        <div className="p-3 card-3d rounded-xl space-y-0.5">
          <span className="text-[11px] text-[var(--text-secondary)]">Lines & Paragraphs</span>
          <div className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">{lineCount.toLocaleString()}</div>
          <div className="text-[10px] text-[var(--text-secondary)] font-mono">{paragraphCount.toLocaleString()} paragraph{paragraphCount === 1 ? '' : 's'}</div>
        </div>

        <div className="p-3 card-3d rounded-xl space-y-0.5">
          <span className="text-[11px] text-[var(--text-secondary)]">Size & Reading Time</span>
          <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">{byteCount.toLocaleString()} B</div>
          <div className="text-[10px] text-[var(--text-secondary)] font-mono">~{readingTimeSec}s read</div>
        </div>
      </div>
    </div>
  );
};
