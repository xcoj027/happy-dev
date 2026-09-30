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
    text: 'text-emerald-500 dark:text-emerald-400',
    bg: 'bg-emerald-500/15',
    colorHex: '#10b981',
    gradient: 'from-emerald-500/20 to-teal-500/20',
  },
  encoders: {
    text: 'text-cyan-500 dark:text-cyan-400',
    bg: 'bg-cyan-500/15',
    colorHex: '#06b6d4',
    gradient: 'from-cyan-500/20 to-sky-500/20',
  },
  crypto: {
    text: 'text-amber-500 dark:text-amber-400',
    bg: 'bg-amber-500/15',
    colorHex: '#f59e0b',
    gradient: 'from-amber-500/20 to-yellow-500/20',
  },
  formatters: {
    text: 'text-indigo-500 dark:text-indigo-400',
    bg: 'bg-indigo-500/15',
    colorHex: '#6366f1',
    gradient: 'from-indigo-500/20 to-violet-500/20',
  },
  datetime: {
    text: 'text-orange-500 dark:text-orange-400',
    bg: 'bg-orange-500/15',
    colorHex: '#f97316',
    gradient: 'from-orange-500/20 to-amber-500/20',
  },
  text: {
    text: 'text-purple-500 dark:text-purple-400',
    bg: 'bg-purple-500/15',
    colorHex: '#a855f7',
    gradient: 'from-purple-500/20 to-fuchsia-500/20',
  },
  generators: {
    text: 'text-pink-500 dark:text-pink-400',
    bg: 'bg-pink-500/15',
    colorHex: '#ec4899',
    gradient: 'from-pink-500/20 to-rose-500/20',
  },
  network: {
    text: 'text-sky-500 dark:text-sky-400',
    bg: 'bg-sky-500/15',
    colorHex: '#0ea5e9',
    gradient: 'from-sky-500/20 to-blue-500/20',
  },
  frontend: {
    text: 'text-rose-500 dark:text-rose-400',
    bg: 'bg-rose-500/15',
    colorHex: '#f43f5e',
    gradient: 'from-rose-500/20 to-pink-500/20',
  },
};

export const getCategoryColor = (category: ToolCategory): CategoryColorTheme => {
  return (
    categoryColors[category] || {
      text: 'text-emerald-500 dark:text-emerald-400',
      bg: 'bg-emerald-500/15',
      colorHex: '#10b981',
      gradient: 'from-emerald-500/20 to-teal-500/20',
    }
  );
};
