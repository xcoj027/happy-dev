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
import { DevRole } from '../../types';

interface BadgeProps {
  role?: DevRole | string;
  variant?: 'role' | 'category' | 'status';
  className?: string;
  children?: React.ReactNode;
}

const roleColors: Record<string, string> = {
  Backend: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  Frontend: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30',
  Fullstack: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30',
  DBA: 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border-amber-500/30',
  BA: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30',
  SA: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
  QA: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
  All: 'bg-gray-500/15 text-gray-700 dark:text-gray-400 border-gray-500/30',
};

export const Badge: React.FC<BadgeProps> = ({ role, variant = 'role', className = '', children }) => {
  const colorClass = role && roleColors[role] ? roleColors[role] : 'bg-gray-500/10 text-gray-400 border-gray-500/20';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${colorClass} ${className}`}
    >
      {children || role}
    </span>
  );
};
