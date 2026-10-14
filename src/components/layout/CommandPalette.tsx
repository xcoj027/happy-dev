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
import { toolsRegistry } from '../../data/toolsRegistry';
import { ToolDefinition } from '../../types';
import { DynamicIcon } from '../common/DynamicIcon';
import { Search, X, CornerDownLeft } from 'lucide-react';
import { getCategoryColor } from '../../utils/categoryColors';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (id: string) => void;
  onCheckForUpdates?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTool,
  onCheckForUpdates,
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
      id: 'action-check-updates',
      name: 'Check for Updates',
      description: 'Check GitHub releases for new HappyDev updates.',
      category: 'network',
      roles: ['All' as any],
      icon: 'RefreshCw',
      tags: ['update', 'version', 'upgrade', 'github', 'release', 'download', 'latest'],
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

  const handleItemSelect = (toolId: string) => {
    if (toolId === 'action-check-updates') {
      onClose();
      onCheckForUpdates?.();
      return;
    }
    onSelectTool(toolId);
    onClose();
  };

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
          handleItemSelect(filtered[selectedIndex].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose, onSelectTool, onCheckForUpdates]);


  if (!isOpen) return null;

  return (
    <div className="search-backdrop fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/40 backdrop-blur-sm p-4">
      <div
        className="search-palette w-full max-w-xl bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="search-field flex items-center px-4.5 py-3.5 bg-slate-50/80 border-b border-slate-200">
          <Search className="search-icon w-5 h-5 text-emerald-600 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a tool name or category (e.g. jwt, hash, diff, json)..."
            className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-700 p-1 mr-2 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-600">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2.5 space-y-1.5">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No developer utility matching "{query}"
            </div>
          ) : (
            filtered.map((tool: ToolDefinition, idx: number) => {
              const isSelected = idx === selectedIndex;
              const catColor = getCategoryColor(tool.category);

              return (
                <button
                  key={tool.id}
                  onClick={() => handleItemSelect(tool.id)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/70 font-semibold translate-x-0.5'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 ${catColor.bg} ${catColor.text}`}
                    >
                      <DynamicIcon name={tool.icon} size={16} />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-900 truncate flex items-center gap-2">
                        <span>{tool.name}</span>
                        <span className={`text-[10px] font-medium capitalize ${catColor.text}`}>
                          • {tool.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5 font-normal">
                        {tool.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4.5 py-3 bg-slate-50/60 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-mono text-[10px]">↑</kbd>{' '}
              <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-mono text-[10px]">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-mono text-[10px]">↵</kbd> to open
            </span>
          </div>
          <span className="font-mono text-emerald-700 font-semibold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60">{toolsRegistry.length} Offline Tools</span>
        </div>
      </div>
    </div>
  );
};
