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

import { IdeEditor } from './IdeEditor';
import React, { useState } from 'react';
import { CopyButton } from './CopyButton';
import { Terminal, WrapText, CheckCircle2 } from 'lucide-react';

export interface ResultPanelProps {
  value: string;
  label?: string;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  language?: string;
  showStats?: boolean;
  actions?: React.ReactNode;
  defaultWrap?: boolean;
  badgeText?: string;
  className?: string;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const ResultPanel: React.FC<ResultPanelProps> = ({
  value,
  label = 'Result',
  placeholder = 'Result will appear here automatically...',
  minHeight = '480px',
  maxHeight = '600px',
  language,
  showStats = true,
  actions,
  defaultWrap = true,
  badgeText = 'Result',
  className = '',
}) => {
  const [wrap, setWrap] = useState(defaultWrap);

  const lineCount = value ? value.split('\n').length : 0;
  const charCount = value ? value.length : 0;
  const byteCount = value ? new TextEncoder().encode(value).length : 0;

  return (
    <div
      className={`well-3d code-result flex flex-col flex-1 h-full min-h-[460px] rounded-2xl overflow-hidden shadow-sm transition-all select-text ${className}`}
    >
      {/* Result Panel Header Bar */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2.5 bg-[var(--well-header-bg)] border-b border-[var(--border-color)] text-xs select-none">
        <div className="flex items-center gap-2.5 font-medium text-[var(--text-secondary)]">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-[var(--text-primary)]">{label}</span>
          <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-600 text-white dark:bg-emerald-500/20 dark:text-emerald-300 shadow-xs">
            {badgeText}
          </span>
          {language && (
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-black/5 dark:bg-black/40 text-[var(--text-secondary)]">
              {language}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Wrap toggle button */}
          <button
            type="button"
            onClick={() => setWrap(!wrap)}
            className={`px-3 py-1.5 rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5 ${
              wrap
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
            }`}
            title={wrap ? 'Line wrapping enabled (click to disable)' : 'Line wrapping disabled (click to enable)'}
          >
            <WrapText className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden sm:inline">{wrap ? 'Wrap' : 'No wrap'}</span>
          </button>

          {actions}

          <CopyButton text={value} label={value ? 'Copy' : undefined} />
        </div>
      </div>

      {/* Result Panel Content Area */}
      <div
        className="relative flex flex-1 min-h-0 overflow-auto bg-[var(--well-readonly-bg)]"
        style={{ minHeight }}
      >
        {value ? (
          <IdeEditor value={value} label={label} language={language} readOnly wrap={wrap} minHeight={minHeight} maxHeight={maxHeight} />
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 h-full min-h-[340px] p-8 text-[var(--text-muted)] select-none bg-[var(--well-readonly-bg)]">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3 text-emerald-500 shadow-xs">
              <Terminal className="w-6 h-6 opacity-80" />
            </div>
            <p className="text-sm font-bold text-[var(--text-primary)] text-center">
              {placeholder && placeholder !== 'Type or paste content here...'
                ? placeholder
                : 'Result will appear here automatically'}
            </p>
            <span className="text-xs text-[var(--text-muted)] mt-1 text-center">
              Output display · Non-editable
            </span>
          </div>
        )}
      </div>

      {/* Result Panel Footer / Stats */}
      {showStats && (
        <div className="shrink-0 flex items-center justify-between px-4 py-2 bg-[var(--well-header-bg)] border-t border-[var(--border-color)] text-[11px] text-[var(--text-muted)] font-mono select-none">
          <div className="flex items-center gap-3">
            <span>{lineCount} lines</span>
            <span>•</span>
            <span>{charCount.toLocaleString()} chars</span>
            <span>•</span>
            <span>{formatBytes(byteCount)}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Read-only code</span>
          </div>
        </div>
      )}
    </div>
  );
};
