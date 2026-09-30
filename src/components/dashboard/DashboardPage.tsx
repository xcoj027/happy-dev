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

import React, { useState, useEffect, useRef } from 'react';
import { toolsRegistry } from '../../data/toolsRegistry';
import { getCategoryColor } from '../../utils/categoryColors';
import { DynamicIcon } from '../common/DynamicIcon';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { DashboardWidget, WidgetWidth, DashboardPreset, getWidgetColSpan } from './DashboardTypes';
import { AddWidgetModal } from './AddWidgetModal';
import {
  Plus,
  GripVertical,
  ExternalLink,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  LayoutDashboard,
} from 'lucide-react';

const STORAGE_KEY = 'happydev_custom_dashboard_v3';

const DEFAULT_WIDGETS: DashboardWidget[] = [
  {
    id: 'w_unix_default',
    toolId: 'unix-timestamp',
    title: 'Unix Epoch & Timestamp Converter',
    colSpan: 6,
    customHeight: 460,
  },
  {
    id: 'w_uuid_default',
    toolId: 'uuid-generator',
    title: 'UUID & Unique ID Generator',
    colSpan: 6,
    customHeight: 460,
  },
  {
    id: 'w_json_default',
    toolId: 'json-formatter',
    title: 'JSON Formatter & Validator',
    colSpan: 12,
    customHeight: 520,
  },
  {
    id: 'w_prop_yaml_default',
    toolId: 'properties-yaml-converter',
    title: 'Properties ⇄ YAML Converter',
    colSpan: 12,
    customHeight: 520,
  },
];

const PRESETS: DashboardPreset[] = [
  {
    id: 'default',
    name: 'Multi-Tool Overview',
    description: 'UUID, Unix Epoch, JSON Formatter, and Properties ⇄ YAML',
    widgets: [
      { toolId: 'unix-timestamp', title: 'Unix Timestamp Converter', colSpan: 6, customHeight: 460 },
      { toolId: 'uuid-generator', title: 'UUID Generator', colSpan: 6, customHeight: 460 },
      { toolId: 'json-formatter', title: 'JSON Formatter', colSpan: 12, customHeight: 520 },
      { toolId: 'properties-yaml-converter', title: 'Properties ⇄ YAML', colSpan: 12, customHeight: 520 },
    ],
  },
  {
    id: 'backend',
    name: 'Backend & API Stack',
    description: 'cURL to Code, JWT Debugger, Password Generator, and Hash Generator',
    widgets: [
      { toolId: 'curl-to-code', title: 'cURL Request to Code', colSpan: 12, customHeight: 520 },
      { toolId: 'jwt-debugger', title: 'JWT Token Debugger', colSpan: 6, customHeight: 460 },
      { toolId: 'password-generator', title: 'Secure Password Generator', colSpan: 6, customHeight: 460 },
      { toolId: 'hash-generator', title: 'Hash & HMAC Generator', colSpan: 12, customHeight: 500 },
    ],
  },
  {
    id: 'frontend',
    name: 'Frontend Design & Web',
    description: 'CSS Flex & Grid, Box Shadow, Base64 Encoder, and Markdown Editor',
    widgets: [
      { toolId: 'css-flex-grid', title: 'Flexbox & Grid Canvas', colSpan: 12, customHeight: 560 },
      { toolId: 'css-box-shadow', title: 'Box Shadow Generator', colSpan: 6, customHeight: 480 },
      { toolId: 'base64-converter', title: 'Base64 Text & File Converter', colSpan: 6, customHeight: 480 },
    ],
  },
  {
    id: 'data',
    name: 'Data & Converters',
    description: 'JSON ⇄ CSV, JSON ⇄ YAML, Number Base, and Properties ⇄ YAML',
    widgets: [
      { toolId: 'json-yaml-converter', title: 'JSON ⇄ YAML', colSpan: 12, customHeight: 520 },
      { toolId: 'properties-yaml-converter', title: 'Properties ⇄ YAML', colSpan: 12, customHeight: 520 },
      { toolId: 'json-csv-converter', title: 'JSON ⇄ CSV / TSV', colSpan: 12, customHeight: 520 },
      { toolId: 'number-base-converter', title: 'Number Base Radix Converter', colSpan: 6, customHeight: 460 },
    ],
  },
];

interface DashboardPageProps {
  onSelectTool: (toolId: string) => void;
}

interface ResizingState {
  widgetId: string;
  mode: 'width' | 'height' | 'both';
  initialCols: number;
  initialHeight: number;
  currentCols: number;
  currentHeight: number;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onSelectTool }) => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(() => {
    try {
      const savedV3 = localStorage.getItem(STORAGE_KEY);
      if (savedV3) {
        const parsed = JSON.parse(savedV3);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((w) => ({ ...w, colSpan: getWidgetColSpan(w) }));
        }
      }
      // Migrate from v2
      const savedV2 = localStorage.getItem('happydev_custom_dashboard_v2');
      if (savedV2) {
        const parsed = JSON.parse(savedV2);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((w: DashboardWidget) => ({
            ...w,
            colSpan: getWidgetColSpan(w),
          }));
        }
      }
    } catch {}
    return DEFAULT_WIDGETS;
  });

  const gridContainerRef = useRef<HTMLDivElement>(null);
  const presetsRef = useRef<HTMLDivElement>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState('');

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const lastSwapTimeRef = useRef<number>(0);

  // Dynamic resize state
  const [resizingState, setResizingState] = useState<ResizingState | null>(null);

  // Close presets dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (presetsRef.current && !presetsRef.current.contains(e.target as Node)) {
        setIsPresetsOpen(false);
      }
    };
    if (isPresetsOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isPresetsOpen]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
    } catch {}
  }, [widgets]);

  // Add widget with smart default width
  const handleAddWidget = (toolId: string, customTitle?: string, width?: WidgetWidth, colSpan?: number) => {
    const tool = toolsRegistry.find((t) => t.id === toolId);
    const wideTools = [
      'json-formatter',
      'properties-yaml-converter',
      'json-yaml-converter',
      'json-csv-converter',
      'text-diff',
      'markdown-editor',
      'curl-to-code',
      'hash-generator',
      'css-flex-grid',
      'regex-tester',
    ];

    let resolvedCols = 6;
    if (typeof colSpan === 'number') {
      resolvedCols = colSpan;
    } else if (width) {
      resolvedCols = width === 'full' ? 12 : width === '2/3' ? 8 : width === '1/3' ? 4 : 6;
    } else if (wideTools.includes(toolId)) {
      resolvedCols = 12;
    }

    const newWidget: DashboardWidget = {
      id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      toolId,
      title: customTitle || tool?.name || 'Utility Section',
      colSpan: resolvedCols,
      customHeight: resolvedCols >= 12 ? 520 : 460,
      isCollapsed: false,
    };
    setWidgets((prev) => [...prev, newWidget]);
  };

  // Remove widget
  const handleRemoveWidget = (widgetId: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
  };

  // Reset section height
  const handleResetSize = (widgetId: string) => {
    setWidgets((prev) =>
      prev.map((w) =>
        w.id === widgetId
          ? { ...w, customHeight: undefined, colSpan: getWidgetColSpan(w) }
          : w
      )
    );
  };

  // Toggle collapse
  const handleToggleCollapse = (widgetId: string) => {
    setWidgets((prev) =>
      prev.map((w) =>
        w.id === widgetId ? { ...w, isCollapsed: !w.isCollapsed } : w
      )
    );
  };

  // Inline title edit
  const handleStartRename = (widget: DashboardWidget) => {
    setEditingTitleId(widget.id);
    setEditingTitleText(widget.title);
  };

  const handleSaveRename = (widgetId: string) => {
    if (editingTitleText.trim()) {
      setWidgets((prev) =>
        prev.map((w) =>
          w.id === widgetId ? { ...w, title: editingTitleText.trim() } : w
        )
      );
    }
    setEditingTitleId(null);
  };

  // Load preset
  const handleLoadPreset = (preset: DashboardPreset) => {
    const newWidgets: DashboardWidget[] = preset.widgets.map((w, idx) => ({
      ...w,
      id: `w_preset_${Date.now()}_${idx}`,
      colSpan: getWidgetColSpan(w as DashboardWidget),
    }));
    setWidgets(newWidgets);
  };

  // Reset to default
  const handleResetDefault = () => {
    if (window.confirm('Reset dashboard to default layout?')) {
      setWidgets(DEFAULT_WIDGETS);
    }
  };

  // ==========================================
  // DYNAMIC DRAG-AND-DROP REORDERING
  // ==========================================
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (resizingState) {
      e.preventDefault();
      return;
    }
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    // Smooth throttle to avoid rapid jitter
    const now = Date.now();
    if (now - lastSwapTimeRef.current < 75) return;
    lastSwapTimeRef.current = now;

    // Live reorder: swap the items so the user sees real-time movement!
    setWidgets((prev) => {
      const list = [...prev];
      const [draggedItem] = list.splice(draggedIndex, 1);
      list.splice(targetIndex, 0, draggedItem);
      return list;
    });
    setDraggedIndex(targetIndex);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedIndex(null);
  };

  // ==========================================
  // DYNAMIC DRAG-TO-RESIZE (WIDTH & HEIGHT)
  // ==========================================
  const handleResizeStart = (
    e: React.MouseEvent,
    widgetId: string,
    mode: 'width' | 'height' | 'both',
    initialCols: number,
    initialHeight: number
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const container = gridContainerRef.current;
    const containerWidth = container ? container.getBoundingClientRect().width : 1200;
    // Each 1/12 grid column pixel width
    const colWidth = containerWidth / 12;

    setResizingState({
      widgetId,
      mode,
      initialCols,
      initialHeight,
      currentCols: initialCols,
      currentHeight: initialHeight,
    });

    document.body.style.userSelect = 'none';

    let lastCols = initialCols;
    let lastHeight = initialHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();

      if (mode === 'width' || mode === 'both') {
        const deltaX = moveEvent.clientX - startX;
        const colDelta = Math.round(deltaX / colWidth);
        lastCols = Math.max(3, Math.min(12, initialCols + colDelta));
      }

      if (mode === 'height' || mode === 'both') {
        const deltaY = moveEvent.clientY - startY;
        lastHeight = Math.max(240, Math.min(1200, Math.round(initialHeight + deltaY)));
      }

      setResizingState({
        widgetId,
        mode,
        initialCols,
        initialHeight,
        currentCols: lastCols,
        currentHeight: lastHeight,
      });

      setWidgets((prev) =>
        prev.map((w) =>
          w.id === widgetId
            ? { ...w, colSpan: lastCols, customHeight: lastHeight }
            : w
        )
      );
    };

    const onMouseUp = () => {
      setResizingState(null);
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="space-y-4 pb-12 relative">
      {/* Global Transparent Mouse Overlay during Active Drag Resizing */}
      {resizingState && (
        <div
          className="fixed inset-0 z-50 pointer-events-auto select-none"
          style={{
            cursor:
              resizingState.mode === 'both'
                ? 'nwse-resize'
                : resizingState.mode === 'width'
                ? 'col-resize'
                : 'row-resize',
          }}
        />
      )}

      {/* Top Dashboard Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-500 shrink-0">
            <LayoutDashboard className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
              Developer Dashboard
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
              {widgets.length} sections
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Preset templates selector */}
          <div ref={presetsRef} className="relative">
            <button
              type="button"
              onClick={() => setIsPresetsOpen((prev) => !prev)}
              className={`btn-3d flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                isPresetsOpen ? 'btn-3d-active' : ''
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Presets</span>
              <ChevronDown
                className={`w-3 h-3 text-[var(--text-muted)] transition-transform duration-150 ${
                  isPresetsOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Presets Dropdown */}
            {isPresetsOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-50 w-60 p-1.5 rounded-xl bg-white dark:bg-[#232835] border border-black/10 dark:border-white/10 animate-fade-in">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-2.5 py-1">
                  Choose Layout Preset
                </div>
                <div className="space-y-0.5">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        handleLoadPreset(preset);
                        setIsPresetsOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15 group/item transition cursor-pointer flex flex-col gap-0.5"
                    >
                      <div className="text-xs font-bold text-[var(--text-primary)] group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400">
                        {preset.name}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)]">
                        {preset.widgets.length} sections
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reset button */}
          <button
            type="button"
            onClick={handleResetDefault}
            className="btn-3d flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
            title="Reset layout to default"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Add Section Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="btn-3d-active flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Section</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {widgets.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#232835] border border-dashed border-black/10 dark:border-white/10 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            Your Dashboard is empty
          </h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            Add your favorite utilities as interactive cards to build your customized command center.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="btn-3d-active inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Section</span>
            </button>
          </div>
        </div>
      ) : (
        /* Dynamic 12-Column Grid Layout with Live Reordering and Drag-Resizing */
        <div
          ref={gridContainerRef}
          className="grid grid-cols-1 md:grid-cols-12 gap-4 transition-all duration-200"
        >
          {widgets.map((widget, index) => {
            const tool = toolsRegistry.find((t) => t.id === widget.toolId);
            if (!tool) return null;

            const ActiveComponent = tool.component;
            const catColor = getCategoryColor(tool.category);
            const isEditingTitle = editingTitleId === widget.id;
            const isBeingDragged = draggedIndex === index;
            const colSpan = getWidgetColSpan(widget);
            const customHeight = widget.customHeight || (colSpan >= 12 ? 520 : 460);
            const isBeingResized = resizingState?.widgetId === widget.id;

            return (
              <div
                key={widget.id}
                onDragOver={handleDragOver}
                onDragEnter={() => handleDragEnter(index)}
                onDrop={handleDrop}
                style={{
                  gridColumn: `span ${colSpan} / span ${colSpan}`,
                }}
                className={`relative transition-all duration-200 ease-out ${
                  isBeingDragged
                    ? 'opacity-40 scale-[0.98] ring-2 ring-emerald-500/70 z-20'
                    : 'opacity-100 z-10'
                }`}
              >
                <div
                  className={`relative flex flex-col h-full rounded-2xl dashboard-card overflow-hidden transition-all duration-150 ${
                    isBeingResized
                      ? 'ring-2 ring-emerald-500/80'
                      : ''
                  }`}
                >
                  {/* Floating Live Dimensions Badge while Resizing */}
                  {isBeingResized && resizingState && (
                    <div className="absolute top-3 right-3 z-40 bg-emerald-600 text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 pointer-events-none animate-fade-in">
                      <span>
                        {resizingState.currentCols}/12 cols (
                        {Math.round((resizingState.currentCols / 12) * 100)}%)
                      </span>
                      <span className="opacity-60">•</span>
                      <span>{resizingState.currentHeight}px</span>
                    </div>
                  )}

                  {/* Section Header Bar - Draggable for Dynamic Repositioning */}
                  <div
                    draggable={!isEditingTitle && !isBeingResized}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnd={handleDragEnd}
                    className="flex items-center justify-between px-3.5 py-2.5 bg-transparent border-b border-black/[0.04] dark:border-white/[0.06] select-none cursor-grab active:cursor-grabbing group/header"
                    title="Drag header to reorder section dynamically"
                  >
                    {/* Left: Drag Handle, Tool Icon, and Editable Title */}
                    <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                      <div className="text-[var(--text-muted)] group-hover/header:text-emerald-500 transition-colors shrink-0">
                        <GripVertical className="w-4 h-4" />
                      </div>

                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${catColor.bg} ${catColor.text}`}
                      >
                        <DynamicIcon name={tool.icon} size={15} />
                      </div>

                      {/* Section Title (Inline Editable) */}
                      {isEditingTitle ? (
                        <div
                          className="flex items-center gap-1.5 min-w-0 flex-1"
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            autoFocus
                            value={editingTitleText}
                            onChange={(e) => setEditingTitleText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(widget.id);
                              if (e.key === 'Escape') setEditingTitleId(null);
                            }}
                            className="w-full bg-[var(--control-panel-bg)] rounded-lg px-2.5 py-1 text-sm font-bold text-[var(--text-primary)] outline-none border border-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveRename(widget.id)}
                            className="p-1 rounded text-emerald-500 hover:bg-emerald-500/10 cursor-pointer"
                            title="Save title"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingTitleId(null)}
                            className="p-1 rounded text-[var(--text-muted)] hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          className="flex items-center gap-2 min-w-0 flex-1 group/title cursor-text"
                          onDoubleClick={() => handleStartRename(widget)}
                          title="Double-click to rename section"
                        >
                          <h3 className="text-sm font-bold text-[var(--text-primary)] truncate tracking-tight">
                            {widget.title}
                          </h3>
                        </div>
                      )}
                    </div>

                    {/* Right: Quick Action Icons (Open Tool, Collapse, Delete) */}
                    <div
                      className="flex items-center gap-1.5 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      {/* Open Standalone Tool */}
                      <button
                        type="button"
                        onClick={() => onSelectTool(tool.id)}
                        className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-emerald-500 hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
                        title="Open full-screen tool"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      {/* Collapse / Expand Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleCollapse(widget.id)}
                        className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
                        title={widget.isCollapsed ? 'Expand section' : 'Collapse section'}
                      >
                        {widget.isCollapsed ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronUp className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Delete Section */}
                      <button
                        type="button"
                        onClick={() => handleRemoveWidget(widget.id)}
                        className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Remove section"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Section Content Area */}
                  {!widget.isCollapsed && (
                    <div
                      style={{
                        height: `${customHeight}px`,
                      }}
                      className="flex-1 p-4 overflow-y-auto"
                    >
                      <ErrorBoundary fallbackToolName={tool.name}>
                        <ActiveComponent />
                      </ErrorBoundary>
                    </div>
                  )}

                  {/* DYNAMIC RESIZE HANDLE 1: RIGHT EDGE (DRAG WIDTH HORIZONTALLY) */}
                  <div
                    onMouseDown={(e) =>
                      handleResizeStart(e, widget.id, 'width', colSpan, customHeight)
                    }
                    className="absolute top-0 right-0 bottom-4 w-2.5 cursor-col-resize z-20 flex items-center justify-center group/resizew select-none hover:bg-emerald-500/10 active:bg-emerald-500/25 transition-colors"
                    title="Drag horizontally to resize section width (cols)"
                  >
                    <div className="w-0.5 h-8 rounded-full bg-black/10 dark:bg-white/15 group-hover/resizew:bg-emerald-500 transition-colors" />
                  </div>

                  {/* DYNAMIC RESIZE HANDLE 2: BOTTOM EDGE (DRAG HEIGHT VERTICALLY) */}
                  {!widget.isCollapsed && (
                    <div
                      onMouseDown={(e) =>
                        handleResizeStart(e, widget.id, 'height', colSpan, customHeight)
                      }
                      onDoubleClick={() => handleResetSize(widget.id)}
                      className="relative h-3 w-full flex items-center justify-center cursor-row-resize bg-black/[0.02] dark:bg-white/[0.02] hover:bg-emerald-500/15 active:bg-emerald-500/25 transition-colors group/resizeh select-none border-t border-black/[0.04] dark:border-white/[0.04] z-20"
                      title="Drag vertically to resize height (Double-click to reset)"
                    >
                      <div className="w-12 h-1 rounded-full bg-black/15 dark:bg-white/20 group-hover/resizeh:bg-emerald-500 transition-colors" />
                    </div>
                  )}

                  {/* DYNAMIC RESIZE HANDLE 3: BOTTOM-RIGHT CORNER (DRAG WIDTH & HEIGHT TOGETHER) */}
                  {!widget.isCollapsed && (
                    <div
                      onMouseDown={(e) =>
                        handleResizeStart(e, widget.id, 'both', colSpan, customHeight)
                      }
                      onDoubleClick={() => handleResetSize(widget.id)}
                      className="absolute right-0 bottom-0 w-5 h-5 cursor-nwse-resize z-30 flex items-center justify-center rounded-br-2xl hover:bg-emerald-500/25 active:bg-emerald-500/40 transition-colors group/resizecorner select-none"
                      title="Drag diagonally to resize width and height simultaneously"
                    >
                      <svg
                        width="8"
                        height="8"
                        viewBox="0 0 8 8"
                        fill="none"
                        className="text-[var(--text-muted)] group-hover/resizecorner:text-emerald-500 transition-colors pointer-events-none"
                      >
                        <path
                          d="M7 1L1 7M7 4L4 7M7 7L6 7"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Widget Modal Picker */}
      <AddWidgetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddWidget={handleAddWidget}
      />
    </div>
  );
};
