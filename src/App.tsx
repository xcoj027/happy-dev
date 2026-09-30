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

import React, { useState, useEffect } from 'react';
import { toolsRegistry } from './data/toolsRegistry';
import { ToolCategory } from './types';
import { Splash } from './components/Splash';
import { TitleBar } from './components/layout/TitleBar';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/layout/CommandPalette';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { DashboardPage } from './components/dashboard/DashboardPage';

export const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [activeToolId, setActiveToolId] = useState<string>('dashboard');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('happydev_theme');
      return saved ? saved === 'dark' : false;
    } catch {
      return false;
    }
  });
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('happydev_favorites');
      return saved ? JSON.parse(saved) : ['base64-converter', 'json-yaml-converter', 'jwt-debugger', 'hash-generator'];
    } catch {
      return ['base64-converter', 'json-yaml-converter', 'jwt-debugger', 'hash-generator'];
    }
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    try {
      localStorage.setItem('happydev_theme', isDark ? 'dark' : 'light');
    } catch {}
  }, [isDark]);

  // Global keyboard shortcuts (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save favorites
  useEffect(() => {
    try {
      localStorage.setItem('happydev_favorites', JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const isDashboard = activeToolId === 'dashboard';

  const dashboardTool = {
    id: 'dashboard',
    name: 'Custom Dashboard',
    description: 'Custom modular workspace. Add, drag, drop, and resize utility sections.',
    category: 'converters' as ToolCategory,
    roles: ['All' as any],
    icon: 'LayoutDashboard',
    tags: ['dashboard', 'workspace', 'modular', 'widgets'],
    component: DashboardPage as any,
  };

  const activeTool = isDashboard
    ? dashboardTool
    : (toolsRegistry.find((t) => t.id === activeToolId) || toolsRegistry[0]);
  const ActiveComponent = activeTool.component;

  return (
    <div className={`h-screen w-screen flex flex-col bg-[var(--bg-main)] overflow-hidden font-sans select-none ${isDark ? 'dark text-gray-100' : 'light text-gray-800'}`}>
      {/* Splash Screen */}
      {showSplash && <Splash onFinish={() => setShowSplash(false)} />}

      {/* Top TitleBar */}
      <TitleBar
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onGoHome={() => setActiveToolId('dashboard')}
      />

      {/* Main Workspace */}
      <div className="app-no-drag flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar */}
        <Sidebar
          activeToolId={activeToolId}
          onSelectTool={(id) => setActiveToolId(id)}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />

        {/* Center Content Stage */}
        <main className="flex-1 h-full min-h-0 overflow-hidden p-4 bg-transparent flex flex-col">
          {isDashboard ? (
            /* Dashboard: Pure borderless canvas without enclosing background box */
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto px-1 py-0.5 bg-transparent">
              <DashboardPage onSelectTool={(id) => setActiveToolId(id)} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-transparent">
              <Header
                tool={activeTool}
                isFavorite={favorites.includes(activeTool.id)}
                onToggleFavorite={toggleFavorite}
              />

              {/* Active Tool View */}
              <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-4 bg-transparent">
                <ErrorBoundary key={activeToolId} fallbackToolName={activeTool.name}>
                  <ActiveComponent />
                </ErrorBoundary>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTool={(id) => setActiveToolId(id)}
      />
    </div>
  );
};
export default App;
