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
      className={`well-3d flex flex-col flex-1 h-full min-h-[460px] rounded-xl overflow-hidden transition-all border border-[var(--border-default)] select-text ${className}`}
    >
      {/* Result Panel Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[var(--well-header-bg)] border-b border-[var(--border-color)] text-xs select-none">
        <div className="flex items-center gap-2 font-medium text-[var(--text-secondary)]">
          <div className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-[var(--text-primary)]">{label}</span>
          <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {badgeText}
          </span>
          {language && (
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/10 dark:bg-black/40 text-[var(--text-secondary)] border border-[var(--border-color)]">
              {language}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Wrap toggle button */}
          <button
            type="button"
            onClick={() => setWrap(!wrap)}
            className={`p-1.5 rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5 ${
              wrap
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--control-panel-bg)]'
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
        className="relative flex flex-1 h-full overflow-auto bg-[var(--surface-recessed)]/50"
        style={{ minHeight }}
      >
        {value ? (
          <pre
            className={`w-full h-full p-4 font-mono text-xs leading-relaxed text-[var(--text-primary)] select-text m-0 ${
              wrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre overflow-x-auto'
            }`}
          >
            {value}
          </pre>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 h-full min-h-[340px] p-6 text-[var(--text-muted)] select-none">
            <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center mb-3 text-[var(--text-muted)] border border-[var(--border-subtle)]">
              <Terminal className="w-5 h-5 opacity-70 text-emerald-500" />
            </div>
            <p className="text-xs font-medium text-[var(--text-secondary)] text-center">
              {placeholder && placeholder !== 'Type or paste content here...'
                ? placeholder
                : 'Result will appear here automatically'}
            </p>
            <span className="text-[11px] text-[var(--text-muted)] mt-1 text-center">
              Ready for output • Non-editable result display
            </span>
          </div>
        )}
      </div>

      {/* Result Panel Footer / Stats */}
      {showStats && (
        <div className="flex items-center justify-between px-3.5 py-1.5 bg-[var(--well-header-bg)] border-t border-[var(--border-color)] text-[11px] text-[var(--text-muted)] font-mono select-none">
          <div className="flex items-center gap-3">
            <span>{lineCount} lines</span>
            <span>•</span>
            <span>{charCount.toLocaleString()} chars</span>
            <span>•</span>
            <span>{formatBytes(byteCount)}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>Output ready</span>
          </div>
        </div>
      )}
    </div>
  );
};
