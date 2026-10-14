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

import { ToolCategory } from '../types';

export interface CategoryColorTheme {
  text: string;
  bg: string;
  colorHex: string;
  gradient: string;
}

export const categoryColors: Record<ToolCategory, CategoryColorTheme> = {
  converters: {
    text: 'text-emerald-700',
    bg: 'bg-emerald-50 border border-emerald-200/60',
    colorHex: '#059669',
    gradient: 'from-emerald-500/15 to-teal-500/15',
  },
  encoders: {
    text: 'text-cyan-700',
    bg: 'bg-cyan-50 border border-cyan-200/60',
    colorHex: '#0891b2',
    gradient: 'from-cyan-500/15 to-sky-500/15',
  },
  crypto: {
    text: 'text-amber-800',
    bg: 'bg-amber-50 border border-amber-200/60',
    colorHex: '#d97706',
    gradient: 'from-amber-500/15 to-yellow-500/15',
  },
  formatters: {
    text: 'text-indigo-700',
    bg: 'bg-indigo-50 border border-indigo-200/60',
    colorHex: '#4f46e5',
    gradient: 'from-indigo-500/15 to-violet-500/15',
  },
  datetime: {
    text: 'text-orange-800',
    bg: 'bg-orange-50 border border-orange-200/60',
    colorHex: '#ea580c',
    gradient: 'from-orange-500/15 to-amber-500/15',
  },
  text: {
    text: 'text-purple-700',
    bg: 'bg-purple-50 border border-purple-200/60',
    colorHex: '#9333ea',
    gradient: 'from-purple-500/15 to-fuchsia-500/15',
  },
  generators: {
    text: 'text-pink-700',
    bg: 'bg-pink-50 border border-pink-200/60',
    colorHex: '#db2777',
    gradient: 'from-pink-500/15 to-rose-500/15',
  },
  network: {
    text: 'text-sky-700',
    bg: 'bg-sky-50 border border-sky-200/60',
    colorHex: '#0284c7',
    gradient: 'from-sky-500/15 to-blue-500/15',
  },
};

export const getCategoryColor = (category: ToolCategory): CategoryColorTheme => {
  return (
    categoryColors[category] || {
      text: 'text-emerald-700',
      bg: 'bg-emerald-50 border border-emerald-200/60',
      colorHex: '#059669',
      gradient: 'from-emerald-500/15 to-teal-500/15',
    }
  );
};
