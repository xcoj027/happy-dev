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
import { toolsRegistry, categories } from '../../data/toolsRegistry';
import { ToolDefinition, ToolCategory } from '../../types';
import { DynamicIcon } from '../common/DynamicIcon';
import { getCategoryColor } from '../../utils/categoryColors';
import {
  Search,
  Star,
  Flame,
  Layers,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  HelpCircle,
} from 'lucide-react';

interface HomePageProps {
  onSelectTool: (id: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectTool,
  favorites,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tools by search query
  const matchesSearch = (tool: ToolDefinition) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.category.toLowerCase().includes(q) ||
      tool.tags.some((t) => t.toLowerCase().includes(q))
    );
  };

  // Popular tools
  const popularTools = toolsRegistry.filter(
    (t) => t.isPopular && matchesSearch(t)
  );

  // Group all tools by category
  const toolsByCategory = categories.map((cat) => ({
    category: cat,
    tools: toolsRegistry.filter(
      (t) => t.category === cat.id && matchesSearch(t)
    ),
  }));

  const totalMatchingTools = toolsRegistry.filter(matchesSearch).length;

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-white dark:bg-[#232835] border border-black/5 dark:border-transparent">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-emerald-500/10 via-cyan-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{toolsRegistry.length}+ Offline Developer Utilities</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            What do you want to build or inspect today?
          </h1>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Fast, zero-latency utilities running 100% locally on your machine.
            Your code, keys, and tokens never leave this device.
          </p>

          {/* Quick Search on Homepage */}
          <div className="relative pt-2 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-5 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Filter ${toolsRegistry.length} utilities by name, category, or keyword...`}
              className="w-full bg-[var(--control-input-bg)] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[var(--text-primary)] outline-none transition border border-black/5 dark:border-transparent placeholder:text-[var(--text-muted)]"
            />
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-[var(--text-muted)] font-mono">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Instant Execution
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Offline & Private
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Native Performance
            </span>
          </div>
        </div>
      </div>

      {/* POPULAR GROUP SECTION */}
      {popularTools.length > 0 && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-500">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <span>Popular Utilities</span>
                  <span className="text-[10px] font-normal px-2 py-0.2 rounded-full bg-amber-500/15 text-amber-500 dark:text-amber-400 font-mono">
                    {popularTools.length} tools
                  </span>
                </h2>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Most frequently used developer tools for everyday workflows
                </p>
              </div>
            </div>
          </div>

          {/* Popular Tools Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {popularTools.map((tool) => {
              const catColor = getCategoryColor(tool.category);
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
                  className="group relative flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#232835] hover:bg-white dark:hover:bg-[#232835]/90 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 select-none"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Left: Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${catColor.bg} ${catColor.text} group-hover:scale-105 transition`}
                    >
                      <DynamicIcon name={tool.icon} size={18} />
                    </div>

                    {/* Right: Utils name and category */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-extrabold text-[var(--text-primary)] group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition tracking-tight truncate">
                        {tool.name}
                      </h3>
                      <span className={`text-[11px] font-semibold ${catColor.text} tracking-wide truncate block`}>
                        {tool.category}
                      </span>
                    </div>
                  </div>

                  {/* Action icons: Favorite & hover arrow */}
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(tool.id);
                      }}
                      className={`p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition shrink-0 cursor-pointer ${
                        isFav
                          ? 'text-amber-500'
                          : 'text-[var(--text-muted)] opacity-0 group-hover:opacity-100 hover:text-amber-500'
                      }`}
                      title={isFav ? 'Remove from favorites' : 'Star as favorite'}
                    >
                      <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ALL UTILITIES GROUPED BY CATEGORY */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span>All Utilities by Category</span>
              <span className="text-[10px] font-normal px-2 py-0.2 rounded-full bg-indigo-500/15 text-indigo-400 font-mono">
                {totalMatchingTools} total
              </span>
            </h2>
            <p className="text-[11px] text-[var(--text-muted)]">
              Browse all {toolsRegistry.length} utilities categorized by specialization
            </p>
          </div>
        </div>

        {totalMatchingTools === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--text-muted)] bg-[var(--control-panel-bg)] rounded-xl">
            No developer utilities matching "{searchQuery}"
          </div>
        ) : (
          toolsByCategory
            .filter((group) => group.tools.length > 0)
            .map(({ category, tools }) => {
              const catColor = getCategoryColor(category.id);

              return (
                <div key={category.id} className="space-y-2.5">
                  {/* Category Header Bar */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center ${catColor.bg} ${catColor.text}`}
                      >
                        <DynamicIcon name={category.icon} size={14} />
                      </div>
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        {category.name}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">
                        ({tools.length})
                      </span>
                    </div>
                  </div>

                  {/* Category Tools Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {tools.map((tool) => {
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
                          className="group relative flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#232835] hover:bg-white dark:hover:bg-[#232835]/90 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 select-none"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Left: Icon */}
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${catColor.bg} ${catColor.text} group-hover:scale-105 transition`}
                            >
                              <DynamicIcon name={tool.icon} size={18} />
                            </div>

                            {/* Right: Utils name and category */}
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-extrabold text-[var(--text-primary)] group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition tracking-tight truncate">
                                {tool.name}
                              </h3>
                              <span className={`text-[11px] font-semibold ${catColor.text} tracking-wide truncate block`}>
                                {category.name}
                              </span>
                            </div>
                          </div>

                          {/* Action icons: Favorite & hover arrow */}
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite(tool.id);
                              }}
                              className={`p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition shrink-0 cursor-pointer ${
                                isFav
                                  ? 'text-amber-500'
                                  : 'text-[var(--text-muted)] opacity-0 group-hover:opacity-100 hover:text-amber-500'
                              }`}
                              title={isFav ? 'Remove from favorites' : 'Star as favorite'}
                            >
                              <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-500 text-amber-500' : ''}`} />
                            </button>
                            <ArrowRight className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
        )}
      </section>
    </div>
  );
};
