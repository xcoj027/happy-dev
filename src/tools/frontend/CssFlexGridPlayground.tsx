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


export const CssFlexGridPlayground: React.FC = () => {
  const [layoutType, setLayoutType] = useState<'flex' | 'grid'>('flex');
  const [itemCount, setItemCount] = useState(4);
  const [flexDirection, setFlexDirection] = useState<'row' | 'column' | 'row-reverse'>('row');
  const [justifyContent, setJustifyContent] = useState('center');
  const [alignItems, setAlignItems] = useState('center');
  const [gap, setGap] = useState(16);
  const [gridCols, setGridCols] = useState(3);

  const flexCss = `display: flex;
flex-direction: ${flexDirection};
justify-content: ${justifyContent};
align-items: ${alignItems};
gap: ${gap}px;`;

  const gridCss = `display: grid;
grid-template-columns: repeat(${gridCols}, minmax(0, 1fr));
gap: ${gap}px;`;

  const generatedCss = layoutType === 'flex' ? flexCss : gridCss;

  return (
    <div className="space-y-4">
      {/* Type Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 card-3d rounded-xl">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLayoutType('flex')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              layoutType === 'flex'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'btn-3d text-[var(--text-secondary)]'
            }`}
          >
            Flexbox Layout
          </button>
          <button
            type="button"
            onClick={() => setLayoutType('grid')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              layoutType === 'grid'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'btn-3d text-[var(--text-secondary)]'
            }`}
          >
            Grid Layout
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
          <label className="flex items-center gap-1.5">
            <span>Items:</span>
            <select
              value={itemCount}
              onChange={(e) => setItemCount(Number(e.target.value))}
              className="input-3d rounded px-2.5 py-1 text-xs outline-none text-[var(--text-primary)]"
            >
              {[3, 4, 6, 8, 12].map(n => <option key={n} value={n}>{n} items</option>)}
            </select>
          </label>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="p-4 card-3d rounded-xl flex flex-wrap gap-4 text-xs text-[var(--text-secondary)]">
        {layoutType === 'flex' ? (
          <>
            <label className="flex items-center gap-1.5">
              <span>Direction:</span>
              <select
                value={flexDirection}
                onChange={(e) => setFlexDirection(e.target.value as any)}
                className="input-3d rounded px-2.5 py-1 text-xs outline-none text-[var(--text-primary)]"
              >
                <option value="row">row</option>
                <option value="column">column</option>
                <option value="row-reverse">row-reverse</option>
              </select>
            </label>

            <label className="flex items-center gap-1.5">
              <span>Justify:</span>
              <select
                value={justifyContent}
                onChange={(e) => setJustifyContent(e.target.value)}
                className="input-3d rounded px-2.5 py-1 text-xs outline-none text-[var(--text-primary)]"
              >
                <option value="flex-start">flex-start</option>
                <option value="center">center</option>
                <option value="flex-end">flex-end</option>
                <option value="space-between">space-between</option>
                <option value="space-around">space-around</option>
              </select>
            </label>

            <label className="flex items-center gap-1.5">
              <span>Align:</span>
              <select
                value={alignItems}
                onChange={(e) => setAlignItems(e.target.value)}
                className="input-3d rounded px-2.5 py-1 text-xs outline-none text-[var(--text-primary)]"
              >
                <option value="stretch">stretch</option>
                <option value="center">center</option>
                <option value="flex-start">flex-start</option>
                <option value="flex-end">flex-end</option>
              </select>
            </label>
          </>
        ) : (
          <label className="flex items-center gap-1.5">
            <span>Columns:</span>
            <select
              value={gridCols}
              onChange={(e) => setGridCols(Number(e.target.value))}
              className="input-3d rounded px-2.5 py-1 text-xs outline-none text-[var(--text-primary)]"
            >
              {[2, 3, 4, 6].map(c => <option key={c} value={c}>{c} columns</option>)}
            </select>
          </label>
        )}

        <label className="flex items-center gap-1.5">
          <span>Gap:</span>
          <input
            type="range"
            min="4"
            max="40"
            value={gap}
            onChange={(e) => setGap(Number(e.target.value))}
            className="w-24 accent-emerald-500"
          />
          <span className="font-mono text-emerald-600 dark:text-emerald-400">{gap}px</span>
        </label>
      </div>

      {/* Visual Canvas */}
      <div
        className="min-h-[220px] p-6 well-3d rounded-xl overflow-auto"
        style={
          layoutType === 'flex'
            ? { display: 'flex', flexDirection, justifyContent, alignItems, gap: `${gap}px` }
            : { display: 'grid', gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`, gap: `${gap}px` }
        }
      >
        {Array.from({ length: itemCount }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-xs flex items-center justify-center min-w-[70px] min-h-[50px]"
          >
            Item #{i + 1}
          </div>
        ))}
      </div>

      {/* Code Export */}
      <div className="p-4 card-3d rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium">
          <span>Generated CSS Code</span>
          <CopyButton text={generatedCss} label="Copy CSS" />
        </div>
        <pre className="p-3.5 well-3d rounded-xl text-xs font-mono text-emerald-600 dark:text-emerald-400 select-all overflow-auto">
          {generatedCss}
        </pre>
      </div>
    </div>
  );
};
