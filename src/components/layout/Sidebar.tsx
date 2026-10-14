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
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  activeToolId: string;
  onSelectTool: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeToolId,
  onSelectTool,
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
      className={`app-no-drag h-full min-h-0 bg-[var(--bg-sidebar)] backdrop-blur-xl border-r border-[var(--border-subtle)] flex flex-col justify-between select-none transition-[width] duration-300 ease-in-out motion-reduce:transition-none shrink-0 z-20 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header / Search / Collapse Toggle */}
      <div className="p-3 space-y-2.5 border-b border-[var(--border-subtle)]">
        {isCollapsed ? (
          <div className="flex flex-col items-center justify-center pt-1">
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-emerald-500 hover:bg-[var(--surface-hover)] transition cursor-pointer"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Utilities
              </span>
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-emerald-600 hover:bg-[var(--surface-hover)] transition cursor-pointer"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="search-field relative rounded-xl">
              <Search className="search-icon w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--text-muted)] pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search utilities (A-Z)..."
                className="w-full bg-[var(--control-input-bg)] rounded-xl pl-8.5 pr-7 py-1.5 text-xs text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:ring-1 focus:ring-emerald-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2 p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
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
      <div className="flex-1 overflow-y-auto px-2.5 py-2.5 space-y-1.5 min-h-0">
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
            isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
          } rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer select-none ${
            activeToolId === 'dashboard'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-bold'
              : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:translate-x-1 hover:text-[var(--text-primary)]'
          }`}
        >
          <div className="flex items-center gap-2.5 pointer-events-none">
            <LayoutDashboard
              className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                activeToolId === 'dashboard' ? 'text-emerald-600' : 'text-emerald-600/70 group-hover:text-emerald-600'
              }`}
            />
            {!isCollapsed && <span>Dashboard</span>}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-[var(--border-subtle)] my-1.5" />

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
                className={`w-full flex items-center rounded-xl text-xs font-semibold transition cursor-pointer text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] ${isCollapsed ? 'justify-center p-2.5' : 'gap-2 px-2.5 py-2.5'}`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${catColor.bg}`}>
                  <DynamicIcon name={category.icon} size={14} className={`${catColor.text} shrink-0`} />
                </div>
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{category.name}</span>
                    <ChevronDown size={14} className={`shrink-0 transition-transform duration-250 ease-in-out motion-reduce:transition-none ${isExpanded ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>
              <AnimatedCollapse id={`sidebar-category-${category.id}`} expanded={isExpanded} keepMounted>
                <div className="min-h-0 overflow-hidden">
                  <div className="ml-3.5 border-l border-[var(--border-subtle)] pl-2 space-y-1 pb-2">
                    {category.tools.map((tool) => (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => onSelectTool(tool.id)}
                        aria-current={activeToolId === tool.id ? 'page' : undefined}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-left transition-all duration-150 cursor-pointer ${activeToolId === tool.id
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-semibold translate-x-0.5'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:translate-x-1 hover:text-[var(--text-primary)]'}`}
                      >
                        <DynamicIcon name={tool.icon} size={14} className={`${catColor.text} shrink-0`} />
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

      {/* Bottom Footer: App Status & Count */}
      <div
        className={`p-3 border-t border-[var(--border-subtle)] bg-[var(--surface-card)] flex items-center ${
          isCollapsed ? 'justify-center' : 'justify-between'
        } text-xs text-[var(--text-secondary)]`}
      >
        {isCollapsed ? (
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-emerald-600 bg-emerald-50 border border-emerald-200/60"
            title={`${toolsRegistry.length} Offline Tools Available`}
          >
            <ShieldCheck className="w-4 h-4" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Offline Suite</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 font-semibold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60">
              {toolsRegistry.length} Tools
            </span>
          </>
        )}
      </div>
    </aside>
  );
};
