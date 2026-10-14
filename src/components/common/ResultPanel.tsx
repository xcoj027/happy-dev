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
      className={`flex flex-col flex-1 h-full min-h-[460px] rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-150 select-text ${className}`}
    >
      {/* Result Panel Header Bar */}
      <div className="shrink-0 flex items-center justify-between px-3.5 py-2.5 bg-slate-50/90 border-b border-slate-200/80 text-xs select-none">
        <div className="flex items-center gap-2 font-medium text-slate-700">
          <div className="w-6.5 h-6.5 rounded-lg bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-600">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-800">{label}</span>
          <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs">
            {badgeText}
          </span>
          {language && (
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/80">
              {language}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Wrap toggle button */}
          <button
            type="button"
            onClick={() => setWrap(!wrap)}
            className={`px-2.5 py-1 rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5 ${
              wrap
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 border border-transparent'
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
        className="relative flex flex-1 min-h-0 overflow-auto bg-[#f8fafc]"
        style={{ minHeight }}
      >
        {value ? (
          <IdeEditor value={value} label={label} language={language} readOnly wrap={wrap} minHeight={minHeight} maxHeight={maxHeight} />
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 h-full min-h-[340px] p-8 text-slate-400 select-none bg-[#f8fafc]">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3 text-emerald-600 shadow-2xs">
              <Terminal className="w-5 h-5 opacity-90" />
            </div>
            <p className="text-sm font-semibold text-slate-700 text-center">
              {placeholder && placeholder !== 'Type or paste content here...'
                ? placeholder
                : 'Result will appear here automatically'}
            </p>
            <span className="text-xs text-slate-400 mt-1 text-center">
              Output display · Non-editable
            </span>
          </div>
        )}
      </div>

      {/* Result Panel Footer / Stats */}
      {showStats && (
        <div className="shrink-0 flex items-center justify-between px-3.5 py-2 bg-slate-50/70 border-t border-slate-200/80 text-[11px] text-slate-500 font-mono select-none">
          <div className="flex items-center gap-2.5">
            <span>{lineCount} lines</span>
            <span className="text-slate-300">•</span>
            <span>{charCount.toLocaleString()} chars</span>
            <span className="text-slate-300">•</span>
            <span>{formatBytes(byteCount)}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-sans font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Read-only output</span>
          </div>
        </div>
      )}
    </div>
  );
};
