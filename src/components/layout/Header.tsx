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

const getCategoryLabel = (toolId: string, category: string): string => {
  if (toolId === 'screen-capture') return 'System & Media';
  if (toolId === 'chmod-calculator') return 'System & Linux';
  switch (category) {
    case 'converters': return 'Converters';
    case 'encoders': return 'Encoders & Decoders';
    case 'crypto': return 'Crypto & Security';
    case 'formatters': return 'Formatters & Minify';
    case 'datetime': return 'Date & Time';
    case 'text': return 'Text & Diff';
    case 'generators': return 'Generators';
    case 'network': return 'Web & System';
    default: return category;
  }
};

export const Header: React.FC<HeaderProps> = ({ tool, isFavorite, onToggleFavorite }) => {
  const catColor = getCategoryColor(tool.category);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 bg-white select-none border-b border-slate-200/90 shrink-0">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${catColor.gradient} flex items-center justify-center ${catColor.text} shrink-0 shadow-2xs`}>
          <DynamicIcon name={tool.icon} size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              {tool.name}
            </h2>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${catColor.bg} ${catColor.text}`}>
              {getCategoryLabel(tool.id, tool.category)}
            </span>

            {tool.description && (
              <div className="relative group/help inline-flex items-center">
                <button
                  type="button"
                  aria-label="Tool description"
                  className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition cursor-help flex items-center justify-center"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>

                {/* Tooltip */}
                <div className="pointer-events-none absolute left-0 top-full mt-2 z-50 opacity-0 group-hover/help:opacity-100 group-focus-within/help:opacity-100 transition-all duration-150 transform scale-95 group-hover/help:scale-100 group-focus-within/help:scale-100 min-w-[260px] max-w-sm p-3 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs leading-relaxed shadow-xl">
                  <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5 text-xs">
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tool Information</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-500">{tool.description}</p>
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
            className={`btn-3d flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer shadow-2xs ${
              isFavorite
                ? 'text-amber-600 bg-amber-50 border-amber-200'
                : 'text-slate-600 hover:text-slate-900'
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
