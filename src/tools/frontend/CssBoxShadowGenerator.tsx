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

import React, { useState } from 'react';
import { CopyButton } from '../../components/common/CopyButton';
import { Layers } from 'lucide-react';

export const CssBoxShadowGenerator: React.FC = () => {
  const [x, setX] = useState(0);
  const [y, setY] = useState(12);
  const [blur, setBlur] = useState(28);
  const [spread, setSpread] = useState(-4);
  const [color, setColor] = useState('rgba(16, 185, 129, 0.35)');
  const [inset, setInset] = useState(false);
  const [boxColor, setBoxColor] = useState('#111827');
  const [borderRadius, setBorderRadius] = useState(16);

  const shadowCss = `${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px ${color}`;

  const fullCss = `box-shadow: ${shadowCss};
border-radius: ${borderRadius}px;
background-color: ${boxColor};`;

  return (
    <div className="space-y-4">
      {/* Visual Canvas */}
      <div data-theme-island className="h-60 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-center p-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(#1f293d_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
        <div
          className="w-48 h-32 flex items-center justify-center text-xs font-semibold text-gray-300 transition-all duration-150 border border-gray-700/50"
          style={{
            boxShadow: shadowCss,
            borderRadius: `${borderRadius}px`,
            backgroundColor: boxColor,
          }}
        >
          HappyDev Preview
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="p-4 card-3d rounded-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="flex justify-between text-[var(--text-secondary)] mb-1">
              <span>Offset X</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">{x}px</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={x}
              onChange={(e) => setX(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-[var(--text-secondary)] mb-1">
              <span>Offset Y</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">{y}px</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={y}
              onChange={(e) => setY(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-[var(--text-secondary)] mb-1">
              <span>Blur Radius</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">{blur}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={blur}
              onChange={(e) => setBlur(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-[var(--text-secondary)] mb-1">
              <span>Spread Radius</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">{spread}px</span>
            </div>
            <input
              type="range"
              min="-30"
              max="50"
              value={spread}
              onChange={(e) => setSpread(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[var(--control-border)] text-xs text-[var(--text-secondary)]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={inset}
              onChange={(e) => setInset(e.target.checked)}
              className="rounded text-emerald-500"
            />
            <span>Inset Shadow</span>
          </label>

          <label className="flex items-center gap-2">
            <span>Border Radius:</span>
            <input
              type="range"
              min="0"
              max="40"
              value={borderRadius}
              onChange={(e) => setBorderRadius(Number(e.target.value))}
              className="w-24 accent-emerald-500"
            />
            <span className="font-mono text-emerald-600 dark:text-emerald-400 w-8">{borderRadius}px</span>
          </label>
        </div>
      </div>

      {/* Code Export */}
      <div className="p-4 card-3d rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium">
          <span>Generated CSS</span>
          <CopyButton text={fullCss} label="Copy CSS" />
        </div>
        <pre className="p-3.5 well-3d rounded-xl text-xs font-mono text-emerald-600 dark:text-emerald-400 select-all overflow-auto">
          {fullCss}
        </pre>
      </div>
    </div>
  );
};
