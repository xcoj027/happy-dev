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

interface AppLogoProps {
  size?: number;
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 20, className = '' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      className={`shrink-0 select-none ${className}`}
      aria-label="HappyDev Logo"
    >
      <defs>
        <linearGradient id="hbWing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="hbBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>

      {/* Far Wing */}
      <polygon points="38,28 20,18 32,38" fill="#1d4ed8" />
      <polygon points="32,38 20,18 26,42" fill="#2563eb" />

      {/* Near Wing */}
      <polygon points="46,36 32,38 26,42" fill="#38bdf8" />
      <polygon points="46,36 26,42 40,50" fill="#0284c7" />
      <polygon points="46,36 40,50 50,46" fill="#06b6d4" />

      {/* Beak */}
      <polygon points="70,35 90,30 72,38" fill="#10b981" />

      {/* Head */}
      <polygon points="60,30 70,35 65,42" fill="#34d399" />
      <polygon points="54,34 60,30 65,42" fill="#10b981" />
      <polygon points="65,42 70,35 72,38" fill="#059669" />

      {/* Neck & Throat */}
      <polygon points="54,34 65,42 58,52" fill="#059669" />
      <polygon points="54,34 58,52 50,46" fill="#10b981" />

      {/* Wing Root */}
      <polygon points="46,36 54,34 50,46" fill="#0ea5e9" />

      {/* Chest & Body */}
      <polygon points="50,46 58,52 52,62" fill="#06b6d4" />
      <polygon points="44,54 50,46 52,62" fill="#0891b2" />

      {/* Lower Back */}
      <polygon points="44,54 52,62 42,70" fill="#0284c7" />
      <polygon points="42,70 52,62 46,76" fill="#2563eb" />

      {/* Tail Feathers */}
      <polygon points="42,70 46,76 34,88" fill="#1d4ed8" />
      <polygon points="46,76 40,86 34,88" fill="#1e40af" />
      <polygon points="42,70 34,88 32,80" fill="#2563eb" />
    </svg>
  );
};
export default AppLogo;
