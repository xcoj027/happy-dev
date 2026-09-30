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
import { FileText, Eye, Code } from 'lucide-react';

export const MarkdownEditor: React.FC = () => {
  const [markdown, setMarkdown] = useState('');
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');

  // Simple, offline GFM markdown to HTML converter
  const renderMarkdown = (md: string) => {
    let html = md
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-gray-200 mt-3 mb-1">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-gray-100 mt-4 mb-2 pb-1 border-b border-gray-800">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-extrabold text-emerald-400 mt-2 mb-3 pb-1 border-b border-gray-800">$1</h1>')
      // Blockquotes
      .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-emerald-500 pl-3 py-1 my-2 text-gray-300 italic bg-gray-900/50 rounded-r">$1</blockquote>')
      // Bold & Italic
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-white">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic text-gray-300">$1</em>')
      // Inline code
      .replace(/`([^`]+)`/gim, '<code class="px-1.5 py-0.5 rounded bg-gray-800 text-emerald-300 font-mono text-xs">$1</code>')
      // Lists
      .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-gray-300">$1</li>')
      // Paragraphs
      .replace(/\n\n/gim, '<div class="h-3"></div>');

    return html;
  };

  return (
    <div className="flex-1 flex flex-col h-full space-y-3 min-h-[540px]">
      {/* View Switcher */}
      <div className="flex items-center justify-between p-3 bg-gray-900/60 rounded-xl border border-gray-800">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-gray-300 font-medium">Markdown Live Preview</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              viewMode === 'split' ? 'bg-emerald-500 text-gray-950 font-bold' : 'bg-gray-800 text-gray-300'
            }`}
          >
            Split View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('edit')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              viewMode === 'edit' ? 'bg-emerald-500 text-gray-950 font-bold' : 'bg-gray-800 text-gray-300'
            }`}
          >
            Editor Only
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              viewMode === 'preview' ? 'bg-emerald-500 text-gray-950 font-bold' : 'bg-gray-800 text-gray-300'
            }`}
          >
            Preview Only
          </button>
        </div>
      </div>

      <div className={`grid gap-4 flex-1 h-full min-h-[500px] ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {(viewMode === 'split' || viewMode === 'edit') && (
          <CodeEditor
            label="Markdown Document"
            value={markdown}
            onChange={setMarkdown}
            language="markdown"
          />
        )}

        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className="flex flex-col flex-1 h-full min-h-[500px] border border-gray-800 rounded-xl overflow-hidden bg-gray-950/80">
            <div className="flex items-center justify-between px-3.5 py-2 bg-gray-900/80 border-b border-gray-800 text-xs">
              <span className="font-medium text-gray-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                Live HTML Preview
              </span>
              <CopyButton text={renderMarkdown(markdown)} label="Copy HTML" />
            </div>
            <div
              className="p-5 text-sm leading-relaxed overflow-auto flex-1 h-full text-gray-200 select-text"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
