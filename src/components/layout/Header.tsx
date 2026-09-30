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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[var(--bg-header)] backdrop-blur-sm select-none transition-colors border-b border-black/5 dark:border-white/5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${catColor.gradient} flex items-center justify-center ${catColor.text} shrink-0`}>
          <DynamicIcon name={tool.icon} size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
              {tool.name}
            </h2>
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${catColor.bg} ${catColor.text}`}>
              {tool.category}
            </span>

            {tool.description && (
              <div className="relative group/help inline-flex items-center">
                <button
                  type="button"
                  aria-label="Tool description"
                  className="p-1 rounded-md text-[var(--text-muted)] hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-black/5 dark:hover:bg-white/10 transition cursor-help flex items-center justify-center"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>

                {/* Tooltip */}
                <div className="pointer-events-none absolute left-0 top-full mt-2 z-50 opacity-0 group-hover/help:opacity-100 group-focus-within/help:opacity-100 transition-all duration-150 transform scale-95 group-hover/help:scale-100 group-focus-within/help:scale-100 min-w-[240px] max-w-sm p-3 rounded-xl bg-[var(--control-panel-bg)] text-[var(--text-secondary)] text-xs leading-relaxed border-0">
                  <div className="font-semibold text-[var(--text-primary)] mb-1 flex items-center gap-1.5 text-xs">
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Tool Information</span>
                  </div>
                  <p>{tool.description}</p>
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
            className={`btn-3d flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
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
