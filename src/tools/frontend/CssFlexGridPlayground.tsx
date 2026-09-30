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
import { LayoutGrid } from 'lucide-react';

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
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-900/60 rounded-xl border border-gray-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLayoutType('flex')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              layoutType === 'flex'
                ? 'bg-emerald-500 text-white'
                : 'bg-black/5 hover:bg-black/10 dark:bg-gray-800 dark:hover:bg-gray-700 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Flexbox Layout
          </button>
          <button
            type="button"
            onClick={() => setLayoutType('grid')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              layoutType === 'grid'
                ? 'bg-emerald-500 text-white'
                : 'bg-black/5 hover:bg-black/10 dark:bg-gray-800 dark:hover:bg-gray-700 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Grid Layout
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-300">
          <label className="flex items-center gap-1.5">
            <span>Items:</span>
            <select
              value={itemCount}
              onChange={(e) => setItemCount(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 outline-none"
            >
              {[3, 4, 6, 8, 12].map(n => <option key={n} value={n}>{n} items</option>)}
            </select>
          </label>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="p-4 bg-gray-900/60 rounded-xl border border-gray-800 flex flex-wrap gap-4 text-xs text-gray-300">
        {layoutType === 'flex' ? (
          <>
            <label className="flex items-center gap-1.5">
              <span>Direction:</span>
              <select
                value={flexDirection}
                onChange={(e) => setFlexDirection(e.target.value as any)}
                className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 outline-none"
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
                className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 outline-none"
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
                className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 outline-none"
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
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 outline-none"
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
          <span className="font-mono text-emerald-400">{gap}px</span>
        </label>
      </div>

      {/* Visual Canvas */}
      <div
        className="min-h-[220px] p-6 bg-gray-950 rounded-xl border border-gray-800 overflow-auto"
        style={
          layoutType === 'flex'
            ? { display: 'flex', flexDirection, justifyContent, alignItems, gap: `${gap}px` }
            : { display: 'grid', gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`, gap: `${gap}px` }
        }
      >
        {Array.from({ length: itemCount }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-xs flex items-center justify-center min-w-[70px] min-h-[50px]"
          >
            Item #{i + 1}
          </div>
        ))}
      </div>

      {/* Code Export */}
      <div className="p-4 bg-[var(--control-panel-bg)] rounded-xl border border-black/5 dark:border-gray-800 space-y-2">
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium">
          <span>Generated CSS Code</span>
          <CopyButton text={generatedCss} label="Copy CSS" />
        </div>
        <pre className="p-3.5 bg-[var(--well-bg)] rounded-xl text-xs font-mono text-emerald-700 dark:text-emerald-400 select-all overflow-auto border border-black/5 dark:border-transparent">
          {generatedCss}
        </pre>
      </div>
    </div>
  );
};
