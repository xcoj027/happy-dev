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
import { Trash2, Upload, FileCode } from 'lucide-react';

interface CodeEditorProps {
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

  return (
    <div className="well-3d flex flex-col flex-1 h-full min-h-[460px] rounded-xl overflow-hidden transition-all focus-within:ring-1 focus-within:ring-emerald-500/50">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[var(--well-header-bg)] border-b border-[var(--border-color)] text-xs">
        <div className="flex items-center gap-2 font-medium text-[var(--text-secondary)]">
          <FileCode className="w-3.5 h-3.5 text-emerald-500" />
          <span>{label || (readOnly ? 'Output' : 'Input')}</span>
          {language && (
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/10 dark:bg-black/40 text-[var(--text-secondary)] border border-[var(--border-color)]">
              {language}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {actions}

          {!readOnly && onChange && (
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
          readOnly={readOnly}
          spellCheck={false}
          style={{ minHeight }}
          className={`w-full h-full min-h-[440px] flex-1 p-3.5 font-mono text-xs leading-relaxed resize-y outline-none transition-colors ${
            readOnly
              ? 'text-[var(--well-readonly-text)] bg-[var(--well-readonly-bg)] cursor-text'
              : 'text-[var(--well-text)] bg-transparent placeholder:text-[var(--text-muted)]'
          }`}
        />
      </div>

      {/* Editor Footer / Stats */}
      {showStats && (
        <div className="flex items-center justify-between px-3.5 py-1.5 bg-[var(--well-header-bg)] border-t border-[var(--border-color)] text-[11px] text-[var(--text-muted)] font-mono">
          <span>{lineCount} lines</span>
          <span>{charCount.toLocaleString()} chars</span>
        </div>
      )}
    </div>
  );
};
