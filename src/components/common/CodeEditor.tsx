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
    <div className="well-3d flex flex-col flex-1 h-full min-h-[460px] rounded-xl overflow-hidden transition-all border border-[var(--border-default)] focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:border-emerald-500/40">
      {/* Input Editor Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[var(--well-header-bg)] border-b border-[var(--border-color)] text-xs select-none">
        <div className="flex items-center gap-2 font-medium text-[var(--text-secondary)]">
          <div className="w-5 h-5 rounded-md bg-sky-500/10 flex items-center justify-center text-sky-500 dark:text-sky-400">
            <FileEdit className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-[var(--text-primary)]">{label || 'Input'}</span>
          <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            Input
          </span>
          {language && (
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/10 dark:bg-black/40 text-[var(--text-secondary)] border border-[var(--border-color)]">
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
                className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--control-panel-bg)] transition cursor-pointer"
                title="Upload file"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="p-1 rounded text-[var(--text-secondary)] hover:text-rose-500 hover:bg-[var(--control-panel-bg)] transition cursor-pointer"
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
      <div className="relative flex flex-1 h-full">
        <textarea
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          style={{ minHeight }}
          className="w-full h-full min-h-[440px] flex-1 p-3.5 font-mono text-xs leading-relaxed resize-y outline-none transition-colors text-[var(--well-text)] bg-transparent placeholder:text-[var(--text-muted)] cursor-text"
        />
      </div>

      {/* Editor Footer / Stats */}
      {showStats && (
        <div className="flex items-center justify-between px-3.5 py-1.5 bg-[var(--well-header-bg)] border-t border-[var(--border-color)] text-[11px] text-[var(--text-muted)] font-mono select-none">
          <div className="flex items-center gap-3">
            <span>{lineCount} lines</span>
            <span>•</span>
            <span>{charCount.toLocaleString()} chars</span>
            <span>•</span>
            <span>{formatBytes(byteCount)}</span>
          </div>

          <span className="text-[10px] text-[var(--text-muted)]">Editable text input</span>
        </div>
      )}
    </div>
  );
};
