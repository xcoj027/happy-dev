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
import { BackgroundArtwork } from './components/common/BackgroundArtwork';
import { TitleBar } from './components/layout/TitleBar';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/layout/CommandPalette';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { UpdateModal } from './components/common/UpdateModal';
import {
  checkForUpdates,
  getDismissedVersion,
  isAutoCheckEnabled,
  UpdateCheckResult,
} from './services/updateChecker';
import { isDesktopApp, showReminderNotification } from './lib/desktop';

export const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [activeToolId, setActiveToolId] = useState<string>('dashboard');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [hasPromptedUpdate, setHasPromptedUpdate] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('happydev_favorites');
      return saved ? JSON.parse(saved) : ['base64-converter', 'json-yaml-converter', 'jwt-debugger', 'hash-generator'];
    } catch {
      return ['base64-converter', 'json-yaml-converter', 'jwt-debugger', 'hash-generator'];
    }
  });

  // Auto check for updates from GitHub releases on open app
  useEffect(() => {
    let isCancelled = false;
    if (!isAutoCheckEnabled()) return;

    checkForUpdates()
      .then((res) => {
        if (isCancelled) return;
        setUpdateInfo(res);
      })
      .catch((err) => {
        console.warn('Auto update check failed silently:', err);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  // Show update modal when splash ends if an update is found and not dismissed
  useEffect(() => {
    if (showSplash || hasPromptedUpdate || !updateInfo?.hasUpdate) return;
    const dismissed = getDismissedVersion() === updateInfo.latestVersion;
    if (!dismissed) {
      setHasPromptedUpdate(true);
      setIsUpdateModalOpen(true);
      if (isDesktopApp()) {
        showReminderNotification({
          title: `HappyDev Update Available (${updateInfo.latestVersion})`,
          body: `A new version of HappyDev is available for download.`,
          silent: false,
        }).catch(() => {});
      }
    }
  }, [showSplash, updateInfo, hasPromptedUpdate]);

  const handleManualCheckForUpdates = async () => {
    setIsUpdateModalOpen(true);
    setIsCheckingUpdate(true);
    try {
      const res = await checkForUpdates({ force: true });
      setUpdateInfo(res);
    } catch (err) {
      console.error('Manual update check error:', err);
    } finally {
      setIsCheckingUpdate(false);
    }
  };


  // Ensure root HTML document is strictly light-themed
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    try {
      localStorage.removeItem('happydev_theme');
    } catch {}
  }, []);

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
    <div className="relative h-screen w-screen flex flex-col bg-transparent overflow-hidden font-sans select-none light text-slate-800">
      {/* Dynamic Ambient Background Layer */}
      <BackgroundArtwork />

      {/* Splash Screen */}
      {showSplash && <Splash onFinish={() => setShowSplash(false)} />}

      {/* Top TitleBar */}
      <TitleBar
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onGoHome={() => setActiveToolId('dashboard')}
        updateInfo={updateInfo}
        onOpenUpdateModal={() => setIsUpdateModalOpen(true)}
      />

      {/* Main Workspace with Clean Panes */}
      <div className="relative z-10 app-no-drag flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar */}
        <Sidebar
          activeToolId={activeToolId}
          onSelectTool={(id) => setActiveToolId(id)}
        />

        {/* Center Content Stage */}
        <main className="flex-1 h-full min-h-0 min-w-0 overflow-hidden p-3.5 sm:p-4 bg-transparent flex flex-col">
          {isDashboard ? (
            /* Dashboard: Pure borderless canvas without enclosing background box */
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto px-1 py-0.5 bg-transparent">
              <DashboardPage onSelectTool={(id) => setActiveToolId(id)} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden min-h-0 glass-panel rounded-2xl border border-slate-200/90 shadow-sm">
              <Header
                tool={activeTool}
                isFavorite={favorites.includes(activeTool.id)}
                onToggleFavorite={toggleFavorite}
              />

              {/* Active Tool View */}
              <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-4 sm:p-5 bg-[#fafbfd]">
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
        onCheckForUpdates={handleManualCheckForUpdates}
      />

      {/* Software Update Modal */}
      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        updateInfo={updateInfo}
        isChecking={isCheckingUpdate}
        onCheckAgain={handleManualCheckForUpdates}
      />
    </div>
  );
};

export default App;
