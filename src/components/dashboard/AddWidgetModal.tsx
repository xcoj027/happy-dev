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

import React, { useState, useMemo } from 'react';
import { toolsRegistry, categories } from '../../data/toolsRegistry';
import { ToolDefinition, ToolCategory } from '../../types';
import { DynamicIcon } from '../common/DynamicIcon';
import { getCategoryColor } from '../../utils/categoryColors';
import { WidgetWidth } from './DashboardTypes';
import { Search, X, Plus } from 'lucide-react';

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (toolId: string, customTitle?: string, width?: WidgetWidth, colSpan?: number) => void;
}

export const AddWidgetModal: React.FC<AddWidgetModalProps> = ({
  isOpen,
  onClose,
  onAddWidget,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<ToolCategory | 'all'>('all');
  const [defaultCols, setDefaultCols] = useState<number>(6);

  const filteredTools = useMemo(() => {
    return toolsRegistry.filter((t) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q));

      const matchesCat = selectedCat === 'all' || t.category === selectedCat;

      return matchesSearch && matchesCat;
    });
  }, [search, selectedCat]);

  if (!isOpen) return null;

  const handleSelectTool = (tool: ToolDefinition) => {
    onAddWidget(tool.id, tool.name, undefined, defaultCols);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl glass-panel rounded-3xl overflow-hidden flex flex-col max-h-[85vh] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-transparent [border-image:linear-gradient(to_right,transparent,rgba(16,185,129,0.35)_20%,rgba(6,182,212,0.3)_50%,rgba(99,102,241,0.25)_80%,transparent)_1]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-xs">
              <Plus className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[var(--text-primary)] tracking-tight">
                Add Utility Section
              </h2>
              <p className="text-xs text-[var(--text-muted)] font-medium">
                Select any offline developer utility to add as an interactive widget.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium">
              <span>Width:</span>
              <select
                value={defaultCols}
                onChange={(e) => setDefaultCols(Number(e.target.value))}
                className="bg-[var(--surface-control)] border border-emerald-500/25 rounded-xl px-2.5 py-1 text-xs text-[var(--text-primary)] outline-none cursor-pointer font-semibold shadow-xs"
              >
                <option value={6}>Half Width (1/2)</option>
                <option value={12}>Full Width (1/1)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 border-b border-transparent [border-image:linear-gradient(to_right,transparent,rgba(16,185,129,0.25)_30%,transparent)_1] space-y-3 bg-transparent">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[var(--text-muted)]" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search 39+ utilities by name, category, or keyword..."
              className="w-full bg-[var(--surface-control)] rounded-xl pl-10 pr-4 py-2 text-xs text-[var(--text-primary)] outline-none border border-emerald-500/25 placeholder:text-[var(--text-muted)] shadow-xs focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCat('all')}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition shrink-0 cursor-pointer shadow-xs ${
                selectedCat === 'all'
                  ? 'btn-3d-active'
                  : 'btn-3d text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              All Categories ({toolsRegistry.length})
            </button>
            {categories.map((cat) => {
              const isSelected = selectedCat === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCat(cat.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition shrink-0 cursor-pointer shadow-xs ${
                    isSelected
                      ? 'btn-3d-active'
                      : 'btn-3d text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tools Grid */}
        <div className="flex-1 overflow-y-auto p-4 max-h-[50vh]">
          {filteredTools.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--text-muted)]">
              No developer utility found matching "{search}"
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredTools.map((tool) => {
                const catColor = getCategoryColor(tool.category);
                return (
                  <div
                    key={tool.id}
                    onClick={() => handleSelectTool(tool)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectTool(tool);
                      }
                    }}
                    className="card-3d group flex items-center justify-between p-3 rounded-2xl transition-all duration-200 cursor-pointer select-none text-left hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-emerald-500/20 ${catColor.bg} ${catColor.text} group-hover:scale-110 transition`}
                      >
                        <DynamicIcon name={tool.icon} size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[var(--text-primary)] group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition truncate">
                          {tool.name}
                        </h4>
                        <span className={`text-[10px] font-medium ${catColor.text} block truncate mt-0.5`}>
                          {tool.category}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      <span className="p-1 rounded-lg text-emerald-500 opacity-0 group-hover:opacity-100 transition flex items-center justify-center bg-emerald-500/10">
                        <Plus className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3.5 bg-transparent border-t border-transparent [border-image:linear-gradient(to_right,transparent,rgba(16,185,129,0.3)_20%,transparent)_1] flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>Click any utility card to immediately add it to your dashboard.</span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">{filteredTools.length} utilities available</span>
        </div>
      </div>
    </div>
  );
};
