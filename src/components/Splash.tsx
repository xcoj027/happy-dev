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

import React, { useEffect, useState } from 'react';
import { AppLogo } from './common/AppLogo';

interface SplashProps {
  onFinish: () => void;
}

const DISPLAY_DURATION_MS = 1800;

export const Splash: React.FC<SplashProps> = ({ onFinish }) => {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        onFinish();
        return;
      }

      setIsFading(true);
    }, DISPLAY_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      data-theme-island
      className={`happy-splash fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#070b14] px-8 text-[#eef6ff] select-none transition-opacity duration-500 ease-out ${
        isFading ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      aria-label="Happy Dev is starting"
      onTransitionEnd={(event) => {
        if (isFading && event.propertyName === 'opacity' && event.currentTarget === event.target) {
          onFinish();
        }
      }}
    >
      <style>{`
        @keyframes happy-splash-arrive {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes happy-splash-halo {
          from { opacity: 0.72; transform: scale(0.94); }
          to { opacity: 1; transform: scale(1); }
        }

        .happy-splash-content {
          animation: happy-splash-arrive 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .happy-splash-halo {
          animation: happy-splash-halo 1100ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .happy-splash,
          .happy-splash-content,
          .happy-splash-halo {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(8, 145, 178, 0.13) 0%, rgba(16, 185, 129, 0.055) 25%, transparent 58%)',
        }}
      />

      <div className="happy-splash-content relative flex w-full max-w-md flex-col items-center text-center">
        <div className="relative mb-8 flex h-32 w-32 items-center justify-center" aria-hidden="true">
          <div className="happy-splash-halo absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.2)_0%,rgba(16,185,129,0.09)_44%,transparent_72%)] blur-xl" />
          <div className="absolute inset-4 rounded-full border border-[#67e8f9]/10 bg-[#0b1422]/70" />
          <AppLogo
            size={82}
            className="relative"
          />
        </div>

        <h1 className="bg-gradient-to-r from-[#6ee7b7] via-[#67e8f9] to-[#60a5fa] bg-clip-text text-4xl font-extrabold tracking-[-0.045em] text-transparent">
          Happy Dev
        </h1>

        <p className="mt-4 text-sm font-medium tracking-[0.015em] text-[#a9bad0]">
          Your local-first developer workspace
        </p>

        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#69dbc6]">
          Free <span className="mx-1.5 text-[#3b586d]">•</span> Offline{' '}
          <span className="mx-1.5 text-[#3b586d]">•</span> Private
        </p>
      </div>
    </div>
  );
};
