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

import { TextInput } from '../../components/common/TextInput';
import React, { useState, useEffect } from 'react';
import { CopyButton } from '../../components/common/CopyButton';
import { Clock, Play, Pause, Calendar } from 'lucide-react';

export const UnixTimestampConverter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'single' | 'datetoepoch'>('single');
  const [currentEpoch, setCurrentEpoch] = useState(Math.floor(Date.now() / 1000));
  const [isLive, setIsLive] = useState(true);

  // Single timestamp inspector
  const [inputEpoch, setInputEpoch] = useState<string>('');
  const [unit, setUnit] = useState<'auto' | 's' | 'ms' | 'us' | 'ns'>('auto');

  // Date to Timestamp state
  const [dateInput, setDateInput] = useState<string>(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
  });
  const [dateTz, setDateTz] = useState<'local' | 'utc'>('local');

  // Live timer tick
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  // Relative time formatter
  const getRelativeTime = (d: Date): string => {
    const diff = (d.getTime() - Date.now()) / 1000;
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const abs = Math.abs(diff);

    if (abs < 60) return rtf.format(Math.round(diff), 'second');
    if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
    if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
    if (abs < 2592000) return rtf.format(Math.round(diff / 86400), 'day');
    if (abs < 31536000) return rtf.format(Math.round(diff / 2592000), 'month');
    return rtf.format(Math.round(diff / 31536000), 'year');
  };

  // Parse single input epoch
  let parsedDate: Date | null = null;
  let detectedUnit = 'seconds';
  try {
    const clean = inputEpoch.trim();
    if (clean) {
      const num = Number(clean);
      if (!isNaN(num)) {
        if (unit === 's') {
          parsedDate = new Date(num * 1000);
          detectedUnit = 'seconds';
        } else if (unit === 'ms') {
          parsedDate = new Date(num);
          detectedUnit = 'milliseconds';
        } else if (unit === 'us') {
          parsedDate = new Date(num / 1000);
          detectedUnit = 'microseconds';
        } else if (unit === 'ns') {
          parsedDate = new Date(num / 1000000);
          detectedUnit = 'nanoseconds';
        } else {
          // Auto detect by digit count
          if (clean.length <= 11) {
            parsedDate = new Date(num * 1000);
            detectedUnit = 'seconds (10 digits)';
          } else if (clean.length <= 14) {
            parsedDate = new Date(num);
            detectedUnit = 'milliseconds (13 digits)';
          } else if (clean.length <= 17) {
            parsedDate = new Date(num / 1000);
            detectedUnit = 'microseconds (16 digits)';
          } else {
            parsedDate = new Date(num / 1000000);
            detectedUnit = 'nanoseconds (19 digits)';
          }
        }
      }
    }
  } catch {}

  const hasSingleInput = !!inputEpoch.trim();
  const isValidDate = parsedDate && !isNaN(parsedDate.getTime());

  // Date to Epoch calculation
  let calculatedEpochMs = 0;
  try {
    if (dateTz === 'utc') {
      calculatedEpochMs = new Date(dateInput + 'Z').getTime();
    } else {
      calculatedEpochMs = new Date(dateInput).getTime();
    }
  } catch {}

  return (
    <div className="flex-1 flex flex-col h-full space-y-4">
      {/* Live Current Epoch Banner */}
      <div className="card-3d p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[var(--text-secondary)]">Current Unix Epoch Timestamp (Seconds)</div>
            <div className="text-xl font-mono font-bold text-orange-600 tracking-wider">
              {currentEpoch}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CopyButton text={currentEpoch.toString()} label="Copy Epoch" />
          <button
            type="button"
            onClick={() => {
              setInputEpoch(currentEpoch.toString());
              setActiveTab('single');
            }}
            className="btn-3d px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition cursor-pointer"
          >
            Insert Below
          </button>
          <button
            type="button"
            onClick={() => setIsLive(!isLive)}
            className="btn-3d p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
            title={isLive ? 'Pause live clock' : 'Resume live clock'}
          >
            {isLive ? <Pause className="w-4 h-4 text-amber-600" /> : <Play className="w-4 h-4 text-emerald-600" />}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('single')}
          className={`btn-3d flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
            activeTab === 'single' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-orange-600" />
          <span>Timestamp → Human Date</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('datetoepoch')}
          className={`btn-3d flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
            activeTab === 'datetoepoch' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          <span>Date & Time → Epoch</span>
        </button>
      </div>

      {/* Tab 1: Single Timestamp to Date */}
      {activeTab === 'single' && (
        <div className="space-y-4">
          <div className="card-3d p-4 rounded-xl space-y-3">
            <span className="text-xs font-semibold text-[var(--text-primary)]">Timestamp Inspector</span>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <TextInput
                type="text"
                value={inputEpoch}
                onChange={(e) => setInputEpoch(e.target.value)}
                placeholder="Enter seconds (10 digits), ms (13 digits), µs (16 digits), or ns (19 digits)..."
                className="input-3d flex-1 w-full px-3.5 py-2 rounded-lg text-sm font-mono text-[var(--text-primary)] outline-none"
              />
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as any)}
                  className="input-3d px-2.5 py-2 rounded-lg text-xs text-[var(--text-secondary)] outline-none"
                >
                  <option value="auto">Auto-Detect Unit</option>
                  <option value="s">Seconds (s)</option>
                  <option value="ms">Milliseconds (ms)</option>
                  <option value="us">Microseconds (µs)</option>
                  <option value="ns">Nanoseconds (ns)</option>
                </select>
                <button
                  type="button"
                  onClick={() => setInputEpoch(Math.floor(Date.now() / 1000).toString())}
                  className="btn-3d px-3 py-2 rounded-lg text-xs text-[var(--text-primary)] cursor-pointer whitespace-nowrap"
                >
                  Now
                </button>
                <button
                  type="button"
                  onClick={() => setInputEpoch('')}
                  className="btn-3d px-2.5 py-2 rounded-lg text-xs text-[var(--text-muted)] hover:text-rose-400 cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>
            {hasSingleInput && (
              <div className="text-[11px] text-[var(--text-muted)]">
                Detected: <span className="text-orange-400 font-mono">{detectedUnit}</span>
              </div>
            )}
          </div>

          {/* Breakdown cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="card-3d p-3.5 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                <span>ISO 8601 (UTC)</span>
                {isValidDate && <CopyButton text={parsedDate!.toISOString()} label="Copy" />}
              </div>
              <div className="text-sm font-mono text-[var(--text-primary)] truncate select-all">
                {hasSingleInput ? (isValidDate ? parsedDate!.toISOString() : 'Invalid Timestamp') : '—'}
              </div>
            </div>

            <div className="card-3d p-3.5 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                <span>Local Timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone})</span>
                {isValidDate && <CopyButton text={parsedDate!.toLocaleString()} label="Copy" />}
              </div>
              <div className="text-sm font-mono text-emerald-700 font-semibold truncate select-all">
                {hasSingleInput ? (isValidDate ? parsedDate!.toLocaleString() : 'Invalid Timestamp') : '—'}
              </div>
            </div>

            <div className="card-3d p-3.5 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                <span>Relative Time</span>
              </div>
              <div className="text-sm font-semibold text-orange-700 truncate">
                {hasSingleInput ? (isValidDate ? getRelativeTime(parsedDate!) : '—') : '—'}
              </div>
            </div>

            <div className="card-3d p-3.5 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                <span>RFC 2822 / GMT</span>
                {isValidDate && <CopyButton text={parsedDate!.toUTCString()} label="Copy" />}
              </div>
              <div className="text-sm font-mono text-[var(--text-primary)] truncate select-all">
                {hasSingleInput ? (isValidDate ? parsedDate!.toUTCString() : 'Invalid') : '—'}
              </div>
            </div>

            <div className="card-3d p-3.5 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                <span>Epoch Milliseconds (13 digits)</span>
                {isValidDate && <CopyButton text={parsedDate!.getTime().toString()} label="Copy" />}
              </div>
              <div className="text-sm font-mono text-cyan-700 font-semibold truncate select-all">
                {hasSingleInput && isValidDate ? parsedDate!.getTime() : '—'}
              </div>
            </div>

            <div className="card-3d p-3.5 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                <span>Unix Hexadecimal</span>
                {isValidDate && <CopyButton text={`0x${Math.floor(parsedDate!.getTime() / 1000).toString(16)}`} label="Copy" />}
              </div>
              <div className="text-sm font-mono text-purple-700 font-semibold truncate select-all">
                {hasSingleInput && isValidDate ? `0x${Math.floor(parsedDate!.getTime() / 1000).toString(16)}` : '—'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Date & Time to Epoch */}
      {activeTab === 'datetoepoch' && (
        <div className="space-y-4">
          <div className="card-3d p-4 rounded-xl space-y-3">
            <span className="text-xs font-semibold text-[var(--text-primary)]">Human Date to Epoch Converter</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[var(--text-secondary)] block mb-1 text-xs">Date & Time (YYYY-MM-DDTHH:mm:ss)</label>
                <input
                  type="datetime-local"
                  step="1"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="input-3d w-full px-3 py-2 rounded-lg text-sm font-mono text-[var(--text-primary)] outline-none"
                />
              </div>
              <div>
                <label className="text-[var(--text-secondary)] block mb-1 text-xs">Timezone Basis</label>
                <select
                  value={dateTz}
                  onChange={(e) => setDateTz(e.target.value as any)}
                  className="input-3d w-full px-2.5 py-2 rounded-lg text-xs text-[var(--text-primary)] outline-none"
                >
                  <option value="local">Local Time ({Intl.DateTimeFormat().resolvedOptions().timeZone})</option>
                  <option value="utc">UTC (Coordinated Universal Time)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="card-3d p-3.5 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                <span>Seconds (10 digits)</span>
                <CopyButton text={Math.floor(calculatedEpochMs / 1000).toString()} label="Copy" />
              </div>
              <div className="text-base font-mono font-bold text-orange-700 truncate">
                {Math.floor(calculatedEpochMs / 1000)}
              </div>
            </div>

            <div className="card-3d p-3.5 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                <span>Milliseconds (13 digits)</span>
                <CopyButton text={calculatedEpochMs.toString()} label="Copy" />
              </div>
              <div className="text-base font-mono font-bold text-cyan-700 truncate">
                {calculatedEpochMs}
              </div>
            </div>

            <div className="card-3d p-3.5 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                <span>Microseconds (16 digits)</span>
                <CopyButton text={`${calculatedEpochMs}000`} label="Copy" />
              </div>
              <div className="text-base font-mono font-bold text-emerald-700 truncate">
                {calculatedEpochMs}000
              </div>
            </div>

            <div className="card-3d p-3.5 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                <span>Nanoseconds (19 digits)</span>
                <CopyButton text={`${calculatedEpochMs}000000`} label="Copy" />
              </div>
              <div className="text-base font-mono font-bold text-purple-700 truncate">
                {calculatedEpochMs}000000
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
