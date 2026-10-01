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

export type WidgetWidth = '1/3' | '1/2' | '2/3' | 'full';
export type WidgetHeight = 'compact' | 'normal' | 'expanded';

export interface DashboardWidget {
  id: string;          // Unique instance id, e.g. "w_123456"
  toolId: string;      // ID in toolsRegistry, e.g. "uuid-generator"
  title: string;       // Custom section name
  width?: WidgetWidth;  // Legacy width fallback
  colSpan?: number;    // Half width (6) or full width (12)
  height?: WidgetHeight;
  customHeight?: number; // Drag-resizable pixel height
  isCollapsed?: boolean;
}

export interface DashboardPreset {
  id: string;
  name: string;
  description: string;
  widgets: Omit<DashboardWidget, 'id'>[];
}

export const getWidgetColSpan = (widget: DashboardWidget): number => {
  if (typeof widget.colSpan === 'number' && Number.isFinite(widget.colSpan)) {
    return widget.colSpan > 6 ? 12 : 6;
  }
  return widget.width === 'full' || widget.width === '2/3' ? 12 : 6;
};
