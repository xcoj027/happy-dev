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

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { toolsRegistry, categories } from '../../data/toolsRegistry';
import { ToolDefinition } from '../../types';
import { DynamicIcon } from '../common/DynamicIcon';
import { Search, X, ArrowRight, CornerDownLeft } from 'lucide-react';
import { getCategoryColor } from '../../utils/categoryColors';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (id: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTool,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const specialPages: ToolDefinition[] = useMemo(() => [
    {
      id: 'dashboard',
      name: 'Custom Dashboard',
      description: 'Custom modular workspace with draggable, resizable utility sections.',
      category: 'converters',
      roles: ['All' as any],
      icon: 'LayoutDashboard',
      tags: ['dashboard', 'workspace', 'modular', 'widgets'],
      component: null as any,
    },
    {
      id: 'home',
      name: 'Utilities Catalog & Hub',
      description: `Browse all ${toolsRegistry.length} developer utilities grouped by category.`,
      category: 'converters',
      roles: ['All' as any],
      icon: 'LayoutGrid',
      tags: ['home', 'catalog', 'hub', 'all'],
      component: null as any,
    },
  ], []);

  const filtered = useMemo(() => {
    const allItems = [...specialPages, ...toolsRegistry];
    const q = query.toLowerCase().trim();
    if (!q) return allItems;
    return allItems.filter(
      (tool) =>
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q) ||
        tool.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [query, specialPages]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          onSelectTool(filtered[selectedIndex].id);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose, onSelectTool]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div
        className="w-full max-w-xl bg-[var(--control-panel-bg)] rounded-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 bg-[var(--control-input-bg)]">
          <Search className="w-5 h-5 text-emerald-500 dark:text-emerald-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a tool name or category (e.g. jwt, hash, diff, json)..."
            className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 mr-2 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--control-panel-bg)] border border-black/5 dark:border-white/10 text-[var(--text-secondary)]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--text-muted)]">
              No developer utility matching "{query}"
            </div>
          ) : (
            filtered.map((tool: ToolDefinition, idx: number) => {
              const isSelected = idx === selectedIndex;
              const catColor = getCategoryColor(tool.category);

              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    onSelectTool(tool.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 font-semibold'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${catColor.bg} ${catColor.text}`}
                    >
                      <DynamicIcon name={tool.icon} size={16} />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-[var(--text-primary)] truncate flex items-center gap-2">
                        <span>{tool.name}</span>
                        <span className={`text-[10px] font-medium capitalize ${catColor.text}`}>
                          • {tool.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] truncate mt-0.5 font-normal">
                        {tool.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-[var(--control-input-bg)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--control-panel-bg)] border border-black/5 dark:border-white/10 text-[var(--text-secondary)]">↑</kbd>{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--control-panel-bg)] border border-black/5 dark:border-white/10 text-[var(--text-secondary)]">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--control-panel-bg)] border border-black/5 dark:border-white/10 text-[var(--text-secondary)]">↵</kbd> to open
            </span>
          </div>
          <span className="font-mono">{toolsRegistry.length} Offline Tools</span>
        </div>
      </div>
    </div>
  );
};
