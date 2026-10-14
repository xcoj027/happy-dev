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

export const BackgroundArtwork: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* Crisp, clean slate-50 light canvas base */}
      <div className="absolute inset-0 bg-[#f8fafc]" />

      {/* Very soft ambient emerald & slate gradient mesh for subtle depth */}
      <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[75vw] h-[380px] rounded-full blur-[130px] pointer-events-none bg-emerald-500/[0.04]" />
      <div className="absolute -bottom-36 -right-20 w-[40vw] h-[360px] rounded-full blur-[140px] pointer-events-none bg-sky-500/[0.03]" />
    </div>
  );
};
