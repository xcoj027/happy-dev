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

interface BackgroundArtworkProps {
  isDark: boolean;
}

export const BackgroundArtwork: React.FC<BackgroundArtworkProps> = ({ isDark }) => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* Cohesive, seamless solid canvas base */}
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          isDark ? 'bg-[#080b11]' : 'bg-[#f1f5f9]'
        }`}
      />

      {/* Gentle, unified ambient emerald glow at top for depth without chaotic colors */}
      <div
        className={`absolute -top-32 left-1/2 -translate-x-1/2 w-[70vw] h-[360px] rounded-full blur-[120px] pointer-events-none transition-opacity duration-700 ${
          isDark ? 'bg-emerald-500/[0.04]' : 'bg-emerald-500/[0.03]'
        }`}
      />
    </div>
  );
};
