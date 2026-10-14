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
import React, { useRef } from 'react';
import { CopyButton } from './CopyButton';
import { Trash2, Upload, FileEdit } from 'lucide-react';
import { ResultPanel, ResultPanelProps } from './ResultPanel';

export { ResultPanel };
export type { ResultPanelProps };

export interface CodeEditorProps {
  value: string;
  onChange?: (val: string) => void;
  label?: string;
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: string;
  maxHeight?: string;
  language?: string;
  showStats?: boolean;
  singleLine?: boolean;
  actions?: React.ReactNode;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Type or paste content here...',
  readOnly = false,
  minHeight = '480px',
  maxHeight = '600px',
  singleLine = false,
  language,
  showStats = true,
  actions,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If readOnly is requested, render the dedicated ResultPanel component
  if (readOnly) {
    return (
      <ResultPanel
        value={value}
        label={label || 'Output Result'}
        placeholder={placeholder}
        minHeight={minHeight}
        maxHeight={maxHeight}
        language={language}
        showStats={showStats}
        actions={actions}
        badgeText="Result"
      />
    );
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onChange) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content !== undefined) onChange(content);
    };
    reader.readAsText(file);
  };

  const lineCount = value ? value.split('\n').length : 0;
  const charCount = value ? value.length : 0;
  const byteCount = value ? new TextEncoder().encode(value).length : 0;

  return (
    <div className="flex flex-col flex-1 h-full min-h-[460px] rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-150 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15">
      {/* Input Editor Header Bar */}
      <div className="shrink-0 flex items-center justify-between px-3.5 py-2.5 bg-slate-50/90 border-b border-slate-200/80 text-xs select-none">
        <div className="flex items-center gap-2 font-medium text-slate-700">
          <div className="w-6.5 h-6.5 rounded-lg bg-sky-50 border border-sky-200/70 flex items-center justify-center text-sky-600">
            <FileEdit className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-800">{label || 'Input'}</span>
          <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200/60 shadow-2xs">
            Input
          </span>
          {language && (
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/80">
              {language}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {actions}

          {onChange && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition cursor-pointer"
                title="Upload file"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                title="Clear input"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          <CopyButton text={value} />
        </div>
      </div>

      {/* Editor Textarea */}
      <div className="relative flex flex-1 min-h-0 bg-white">
        <IdeEditor value={value} onChange={onChange} label={label || 'Input'} placeholder={placeholder} language={language} minHeight={minHeight} maxHeight={maxHeight} singleLine={singleLine} />
      </div>

      {/* Editor Footer / Stats */}
      {showStats && (
        <div className="shrink-0 flex items-center justify-between px-3.5 py-2 bg-slate-50/70 border-t border-slate-200/80 text-[11px] text-slate-500 font-mono select-none">
          <div className="flex items-center gap-2.5">
            <span>{lineCount} lines</span>
            <span className="text-slate-300">•</span>
            <span>{charCount.toLocaleString()} chars</span>
            <span className="text-slate-300">•</span>
            <span>{formatBytes(byteCount)}</span>
          </div>

          <span className="text-[10px] text-slate-400 font-sans">Tab to indent · ⌘F to search</span>
        </div>
      )}
    </div>
  );
};
