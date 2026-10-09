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

import React from 'react';
import { ToolDefinition } from '../../types';
import { DynamicIcon } from '../common/DynamicIcon';
import { Star, HelpCircle } from 'lucide-react';
import { getCategoryColor } from '../../utils/categoryColors';

interface HeaderProps {
  tool: ToolDefinition;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ tool, isFavorite, onToggleFavorite }) => {
  const catColor = getCategoryColor(tool.category);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[var(--bg-header)] backdrop-blur-xl select-none transition-colors border-b border-transparent [border-image:linear-gradient(to_right,transparent,rgba(16,185,129,0.35)_20%,rgba(6,182,212,0.3)_50%,rgba(99,102,241,0.25)_80%,transparent)_1]">
      <div className="flex items-center gap-3.5">
        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${catColor.gradient} border border-emerald-500/25 flex items-center justify-center ${catColor.text} shrink-0 shadow-xs transition-transform hover:scale-105`}>
          <DynamicIcon name={tool.icon} size={22} />
        </div>
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-base font-extrabold text-[var(--text-primary)] tracking-tight">
              {tool.name}
            </h2>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full ${catColor.bg} ${catColor.text} border border-emerald-500/25 shadow-xs`}>
              {tool.category}
            </span>

            {tool.description && (
              <div className="relative group/help inline-flex items-center">
                <button
                  type="button"
                  aria-label="Tool description"
                  className="p-1 rounded-xl text-[var(--text-muted)] hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-[var(--surface-hover)] transition cursor-help flex items-center justify-center"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>

                {/* Tooltip */}
                <div className="pointer-events-none absolute left-0 top-full mt-2.5 z-50 opacity-0 group-hover/help:opacity-100 group-focus-within/help:opacity-100 transition-all duration-200 transform scale-95 group-hover/help:scale-100 group-focus-within/help:scale-100 min-w-[260px] max-w-sm p-3.5 rounded-2xl glass-panel text-[var(--text-secondary)] text-xs leading-relaxed shadow-xl">
                  <div className="font-bold text-[var(--text-primary)] mb-1.5 flex items-center gap-1.5 text-xs">
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Tool Information</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">{tool.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {tool.id !== 'home' && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleFavorite(tool.id)}
            className={`btn-3d flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs ${
              isFavorite
                ? 'text-amber-500'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Pin to favorites'}
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>{isFavorite ? 'Pinned' : 'Pin Tool'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
