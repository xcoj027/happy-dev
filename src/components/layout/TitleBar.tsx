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
import { Search } from 'lucide-react';
import { AppLogo } from '../common/AppLogo';

interface TitleBarProps {
  onOpenCommandPalette: () => void;
  onGoHome?: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({ onOpenCommandPalette, onGoHome }) => {
  const isMac = typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac');

  return (
    <header
      data-tauri-drag-region="deep"
      className="h-11 w-full bg-white border-b border-slate-200/90 flex items-center justify-between px-3.5 select-none text-xs text-slate-600 z-40"
    >
      {/* Left side: Mac traffic light spacing or App branding */}
      <div className="flex items-center gap-2">
        {/* Leave room for the native macOS window controls. */}
        <div className={isMac ? 'w-16' : ''} />
        <div
          onClick={onGoHome}
          data-tauri-drag-region="false"
          className="app-no-drag flex items-center gap-2.5 font-semibold text-slate-800 cursor-pointer group transition"
          title="Go to Homepage"
        >
          <div className="p-1 rounded-xl bg-gradient-to-tr from-emerald-500/15 to-cyan-500/15 group-hover:scale-105 transition-transform">
            <AppLogo size={18} className="w-4.5 h-4.5" />
          </div>
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent font-extrabold tracking-tight text-sm">
            HappyDev
          </span>
          <span className="text-[10px] text-emerald-700 font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60">
            {__APP_VERSION__}
          </span>
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <div data-tauri-drag-region="false" className="app-no-drag flex-1 max-w-sm mx-4">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="search-trigger btn-3d w-full flex items-center justify-between px-3.5 py-1.5 rounded-full text-slate-500 hover:text-slate-800 transition group cursor-pointer bg-white border border-slate-200/90 shadow-2xs"
        >
          <div className="flex items-center gap-2 text-xs">
            <Search className="search-icon w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition" />
            <span className="text-[11px] font-medium text-slate-500">Search utilities...</span>
          </div>
          <kbd className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200/80 text-slate-500">
            {isMac ? '⌘K' : 'Ctrl+K'}
          </kbd>
        </button>
      </div>

      {/* Right side: Status indicator & Windows controls */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-medium text-slate-400 tracking-wide">
          By <span className="font-semibold text-slate-700">TNQ</span>
        </span>
        <div
          className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60"
          title="100% Offline Mode Active"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span>OFFLINE</span>
        </div>
      </div>
    </header>
  );
};
