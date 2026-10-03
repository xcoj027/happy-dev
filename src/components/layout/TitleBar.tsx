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
      className="h-10 w-full bg-[var(--bg-titlebar)] flex items-center justify-between px-3 select-none text-xs text-[var(--text-secondary)] z-40 transition-colors"
    >
      {/* Left side: Mac traffic light spacing or App branding */}
      <div className="flex items-center gap-2">
        {/* Leave room for the native macOS window controls. */}
        <div className={isMac ? 'w-16' : ''} />
        <div
          onClick={onGoHome}
          data-tauri-drag-region="false"
          className="app-no-drag flex items-center gap-2 font-semibold text-[var(--text-primary)] cursor-pointer hover:opacity-85 transition"
          title="Go to Homepage"
        >
          <AppLogo size={18} className="w-4.5 h-4.5" />
          <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent font-bold">
            HappyDev
          </span>
          <span className="text-[10px] text-[var(--text-muted)] font-mono px-1.5 py-0.5 rounded bg-[var(--control-panel-bg)]">
            {__APP_VERSION__}
          </span>
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <div data-tauri-drag-region="false" className="app-no-drag flex-1 max-w-sm mx-4">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="search-trigger btn-3d w-full flex items-center justify-between px-3 py-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition group cursor-pointer"
        >
          <div className="flex items-center gap-2 text-xs">
            <Search className="search-icon w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-emerald-500 transition" />
            <span>Search dev utilities...</span>
          </div>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--control-input-bg)] text-[var(--text-secondary)]">
            {isMac ? '⌘K' : 'Ctrl+K'}
          </kbd>
        </button>
      </div>

      {/* Right side: Status indicator & Windows controls */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-medium text-[var(--text-muted)] tracking-wide">
          By <span className="font-bold text-[var(--text-primary)]">TNQ</span>
        </span>
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-500 font-mono font-medium" title="100% Offline Mode Active">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>
    </header>
  );
};
