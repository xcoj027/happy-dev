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
import { categories, toolsRegistry } from '../../data/toolsRegistry';
import { ToolCategory } from '../../types';
import { DynamicIcon } from '../common/DynamicIcon';
import { getCategoryColor } from '../../utils/categoryColors';
import {
  Star,
  Search,
  Moon,
  Sun,
  ChevronDown,
  Layers,
  LayoutGrid,
  LayoutDashboard,
} from 'lucide-react';

interface SidebarProps {
  activeToolId: string;
  onSelectTool: (id: string) => void;
  selectedCategory: ToolCategory | 'all';
  onSelectCategory: (cat: ToolCategory | 'all') => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeToolId,
  onSelectTool,
  selectedCategory,
  onSelectCategory,
  favorites,
  onToggleFavorite,
  isDark,
  onToggleTheme,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Categories sorted by Name (A-Z)
  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));

  // Filter tools by category and search
  const filteredTools = toolsRegistry.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCat =
      selectedCategory === 'all' || tool.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  // All filtered tools sorted by Name (A-Z)
  const sortedFilteredTools = [...filteredTools].sort((a, b) => a.name.localeCompare(b.name));

  // Favorite tools sorted by Name (A-Z)
  const sortedFavoriteTools = toolsRegistry
    .filter((t) => favorites.includes(t.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <aside className="app-no-drag w-68 h-full min-h-0 bg-[var(--bg-sidebar)] flex flex-col justify-between select-none transition-colors shrink-0 z-10">
      {/* Top Header / Filters */}
      <div className="p-3 space-y-2.5">
        {/* Category Dropdown (Sorted A-Z) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] font-semibold px-0.5">
            <span className="flex items-center gap-1.5">
              <Layers className={`w-3.5 h-3.5 ${selectedCategory === 'all' ? 'text-emerald-500' : getCategoryColor(selectedCategory).text}`} /> Category:
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">
              {selectedCategory === 'all' ? `All (${toolsRegistry.length})` : `${sortedFilteredTools.length} tools`}
            </span>
          </div>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => onSelectCategory(e.target.value as any)}
              className="w-full bg-[var(--control-input-bg)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-primary)] outline-none appearance-none font-medium pr-8 cursor-pointer hover:bg-[var(--control-panel-bg)] transition"
            >
              <option value="all">All Categories ({toolsRegistry.length})</option>
              {sortedCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search utilities (A-Z)..."
            className="w-full bg-[var(--control-input-bg)] rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)]"
          />
        </div>
      </div>

      {/* Tools Scrollable Navigation List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-3 min-h-0">
        {/* Custom Modular Dashboard */}
        <div
          onClick={() => onSelectTool('dashboard')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectTool('dashboard');
            }
          }}
          className={`w-full group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer select-none ${
            activeToolId === 'dashboard'
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : 'text-[var(--text-secondary)] hover:bg-[var(--control-panel-bg)] hover:text-[var(--text-primary)]'
          }`}
        >
          <div className="flex items-center gap-2 pointer-events-none">
            <LayoutDashboard className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Dashboard</span>
          </div>
        </div>

        {/* All Utilities Catalog */}
        <div
          onClick={() => onSelectTool('home')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectTool('home');
            }
          }}
          className={`w-full group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer select-none ${
            activeToolId === 'home'
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : 'text-[var(--text-secondary)] hover:bg-[var(--control-panel-bg)] hover:text-[var(--text-primary)]'
          }`}
        >
          <div className="flex items-center gap-2 pointer-events-none">
            <LayoutGrid className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Utilities Catalog</span>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-muted)] px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/5">
            {toolsRegistry.length}
          </span>
        </div>

        {/* Pinned Favorites Section */}
        {sortedFavoriteTools.length > 0 && selectedCategory === 'all' && !searchTerm && (
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 text-[10px] uppercase font-bold tracking-wider text-amber-500/90 dark:text-amber-400/90">
              <span className="flex items-center gap-1.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>Favorites ({sortedFavoriteTools.length})</span>
              </span>
              <span className="text-[9px] text-[var(--text-muted)]">Sorted A-Z</span>
            </div>
            <div className="space-y-0.5">
              {sortedFavoriteTools.map((tool) => {
                const isActive = activeToolId === tool.id;
                return (
                  <div
                    key={tool.id}
                    onClick={() => onSelectTool(tool.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectTool(tool.id);
                      }
                    }}
                    className={`w-full group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer select-none ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 font-semibold'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--control-panel-bg)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="flex-1 flex items-center gap-2 truncate text-left pointer-events-none">
                      <DynamicIcon name={tool.icon} size={14} className={`${getCategoryColor(tool.category).text} shrink-0`} />
                      <span className="truncate">{tool.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(tool.id);
                      }}
                      className="p-1 rounded text-amber-500 hover:text-rose-500 transition shrink-0 ml-1 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10"
                      title="Unpin favorite"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Utilities List (Sorted A-Z) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
            <span>Utilities ({sortedFilteredTools.length})</span>
            <span className="text-[9px] text-[var(--text-muted)]">Sorted A-Z</span>
          </div>

          {sortedFilteredTools.length === 0 ? (
            <div className="text-xs text-[var(--text-muted)] px-3 py-6 text-center">
              No utilities matching "{searchTerm}"
            </div>
          ) : (
            <div className="space-y-0.5">
              {sortedFilteredTools.map((tool) => {
                const isActive = activeToolId === tool.id;
                const isFav = favorites.includes(tool.id);

                return (
                  <div
                    key={tool.id}
                    onClick={() => onSelectTool(tool.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectTool(tool.id);
                      }
                    }}
                    className={`w-full group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer select-none ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 font-semibold'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--control-panel-bg)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="flex-1 flex items-center gap-2 truncate text-left pointer-events-none">
                      <DynamicIcon
                        name={tool.icon}
                        size={14}
                        className={`${getCategoryColor(tool.category).text} shrink-0`}
                      />
                      <span className="truncate">{tool.name}</span>
                    </div>

                    {/* Star Icon for quick favoriting directly on any row */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(tool.id);
                      }}
                      className={`p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition shrink-0 ml-1 cursor-pointer ${
                        isFav
                          ? 'text-amber-500'
                          : 'text-[var(--text-muted)] opacity-0 group-hover:opacity-100 hover:text-amber-500'
                      }`}
                      title={isFav ? 'Remove from favorites' : 'Star as favorite'}
                    >
                      <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer: Theme & App Details */}
      <div className="p-3 bg-[var(--bg-sidebar)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
        <button
          type="button"
          onClick={onToggleTheme}
          className="btn-3d flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
          <span className="text-[11px] font-medium">{isDark ? 'Light' : 'Dark'}</span>
        </button>

        <span className="text-[11px] font-mono text-[var(--text-muted)]">{toolsRegistry.length} Utilities</span>
      </div>
    </aside>
  );
};
