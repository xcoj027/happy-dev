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

import { AnimatedCollapse } from '../common/AnimatedCollapse';
import React, { useState, useEffect } from 'react';
import { categories, toolsRegistry } from '../../data/toolsRegistry';
import { DynamicIcon } from '../common/DynamicIcon';
import { getCategoryColor } from '../../utils/categoryColors';
import {
  Search,
  Moon,
  Sun,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  ChevronDown,
} from 'lucide-react';

interface SidebarProps {
  activeToolId: string;
  onSelectTool: (id: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeToolId,
  onSelectTool,
  isDark,
  onToggleTheme,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(() =>
    toolsRegistry.find((tool) => tool.id === activeToolId)?.category ?? null
  );

  useEffect(() => {
    setExpandedCategory(toolsRegistry.find((tool) => tool.id === activeToolId)?.category ?? null);
  }, [activeToolId]);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('happydev_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('happydev_sidebar_collapsed', String(isCollapsed));
    } catch {}
  }, [isCollapsed]);

  // Filter tools by search query (A-Z)
  const filteredTools = toolsRegistry.filter((tool) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      tool.name.toLowerCase().includes(term) ||
      tool.description.toLowerCase().includes(term) ||
      tool.category.toLowerCase().includes(term) ||
      tool.tags.some((t) => t.toLowerCase().includes(term))
    );
  });

  const filteredCategories = categories.map((category) => ({
    ...category,
    tools: filteredTools.filter((tool) => tool.category === category.id),
  })).filter((category) => category.tools.length > 0);

  return (
    <aside
      className={`app-no-drag h-full min-h-0 bg-[var(--bg-sidebar)] flex flex-col justify-between select-none transition-[width] duration-300 ease-in-out motion-reduce:transition-none shrink-0 z-20 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header / Search / Collapse Toggle */}
      <div className="p-2.5 space-y-2 border-b border-black/[0.04] dark:border-white/[0.04]">
        {isCollapsed ? (
          <div className="flex flex-col items-center justify-center pt-1">
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-emerald-500 hover:bg-[var(--control-panel-bg)] transition cursor-pointer"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Utilities
              </span>
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-emerald-500 hover:bg-[var(--control-panel-bg)] transition cursor-pointer"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="search-field relative rounded-lg">
              <Search className="search-icon w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[var(--text-muted)] pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search utilities (A-Z)..."
                className="w-full bg-[var(--control-input-bg)] rounded-lg pl-8 pr-7 py-1.5 text-xs text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:ring-1 focus:ring-emerald-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-2 p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Navigation Links Scrollable List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 min-h-0">
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
          title={isCollapsed ? 'Dashboard' : undefined}
          className={`w-full group flex items-center ${
            isCollapsed ? 'justify-center p-2.5' : 'justify-between px-2.5 py-2'
          } rounded-xl text-xs font-semibold transition cursor-pointer select-none ${
            activeToolId === 'dashboard'
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-[var(--text-secondary)] hover:bg-[var(--control-panel-bg)] hover:text-[var(--text-primary)]'
          }`}
        >
          <div className="flex items-center gap-2.5 pointer-events-none">
            <LayoutDashboard
              className={`w-4 h-4 shrink-0 ${
                activeToolId === 'dashboard' ? 'text-emerald-500' : 'text-emerald-500/80 group-hover:text-emerald-500'
              }`}
            />
            {!isCollapsed && <span>Dashboard</span>}
          </div>
        </div>

        {/* Divider */}
        <div className="my-1 border-t border-black/[0.04] dark:border-white/[0.04]" />

        {filteredCategories.length === 0 ? (
          <div className="text-xs text-[var(--text-muted)] px-2 py-6 text-center">
            {!isCollapsed && `No utilities matching "${searchTerm}"`}
          </div>
        ) : filteredCategories.map((category) => {
          const isExpanded = !isCollapsed && expandedCategory === category.id;
          const catColor = getCategoryColor(category.id);
          return (
            <div key={category.id}>
              <button
                type="button"
                title={isCollapsed ? category.name : undefined}
                aria-label={category.name}
                aria-expanded={isExpanded}
                aria-controls={`sidebar-category-${category.id}`}
                onClick={() => {
                  setExpandedCategory(isExpanded ? null : category.id);
                  if (isCollapsed) setIsCollapsed(false);
                }}
                className={`w-full flex items-center rounded-xl text-xs font-semibold transition cursor-pointer text-[var(--text-secondary)] hover:bg-[var(--control-panel-bg)] ${isCollapsed ? 'justify-center p-2.5' : 'gap-2 px-2.5 py-2.5'}`}
              >
                <DynamicIcon name={category.icon} size={16} className={`${catColor.text} shrink-0`} />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{category.name}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{category.tools.length}</span>
                    <ChevronDown size={14} className={`shrink-0 transition-transform duration-250 ease-in-out motion-reduce:transition-none ${isExpanded ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>
              <AnimatedCollapse id={`sidebar-category-${category.id}`} expanded={isExpanded} keepMounted>
                <div className="min-h-0 overflow-hidden">
                  <div className="ml-3 border-l border-black/[0.06] dark:border-white/[0.06] pl-2 space-y-0.5 pb-2">
                    {category.tools.map((tool) => (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => onSelectTool(tool.id)}
                        aria-current={activeToolId === tool.id ? 'page' : undefined}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-left transition cursor-pointer ${activeToolId === tool.id
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--control-panel-bg)] hover:text-[var(--text-primary)]'}`}
                      >
                        <DynamicIcon name={tool.icon} size={15} className={`${catColor.text} shrink-0`} />
                        <span className="truncate">{tool.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </AnimatedCollapse>
            </div>
          );
        })}
      </div>

      {/* Bottom Footer: Theme & App Details */}
      <div
        className={`p-2.5 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center ${
          isCollapsed ? 'justify-center' : 'justify-between'
        } text-xs text-[var(--text-secondary)]`}
      >
        <button
          type="button"
          onClick={onToggleTheme}
          className={`btn-3d flex items-center ${
            isCollapsed ? 'p-2 justify-center' : 'gap-1.5 px-2.5 py-1.5'
          } rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer`}
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDark ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-indigo-500" />
          )}
          {!isCollapsed && (
            <span className="text-[11px] font-medium">
              {isDark ? 'Light' : 'Dark'}
            </span>
          )}
        </button>

        {!isCollapsed && (
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            {toolsRegistry.length} Tools
          </span>
        )}
      </div>
    </aside>
  );
};
