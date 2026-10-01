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
import { Globe, Search, Plus, Trash2 } from 'lucide-react';

interface ZoneItem {
  id: string;
  city: string;
  country: string;
  tz: string;
  code: string;
}

const ALL_ZONES: ZoneItem[] = [
  { id: 'utc', city: 'UTC / GMT', country: 'Global Standard', tz: 'UTC', code: 'UTC' },
  { id: 'lon', city: 'London', country: 'United Kingdom', tz: 'Europe/London', code: 'GMT/BST' },
  { id: 'par', city: 'Paris', country: 'France', tz: 'Europe/Paris', code: 'CET/CEST' },
  { id: 'ber', city: 'Berlin', country: 'Germany', tz: 'Europe/Berlin', code: 'CET/CEST' },
  { id: 'nyc', city: 'New York', country: 'United States (East)', tz: 'America/New_York', code: 'EST/EDT' },
  { id: 'chi', city: 'Chicago', country: 'United States (Central)', tz: 'America/Chicago', code: 'CST/CDT' },
  { id: 'den', city: 'Denver', country: 'United States (Mountain)', tz: 'America/Denver', code: 'MST/MDT' },
  { id: 'lax', city: 'Los Angeles / SF', country: 'United States (West)', tz: 'America/Los_Angeles', code: 'PST/PDT' },
  { id: 'tor', city: 'Toronto', country: 'Canada', tz: 'America/Toronto', code: 'EST/EDT' },
  { id: 'sao', city: 'São Paulo', country: 'Brazil', tz: 'America/Sao_Paulo', code: 'BRT' },
  { id: 'han', city: 'Hanoi / Bangkok', country: 'Vietnam / Thailand', tz: 'Asia/Bangkok', code: 'ICT' },
  { id: 'sin', city: 'Singapore', country: 'Singapore', tz: 'Asia/Singapore', code: 'SGT' },
  { id: 'hkg', city: 'Hong Kong', country: 'China', tz: 'Asia/Hong_Kong', code: 'HKT' },
  { id: 'tok', city: 'Tokyo', country: 'Japan', tz: 'Asia/Tokyo', code: 'JST' },
  { id: 'seo', city: 'Seoul', country: 'South Korea', tz: 'Asia/Seoul', code: 'KST' },
  { id: 'syd', city: 'Sydney', country: 'Australia', tz: 'Australia/Sydney', code: 'AEST/AEDT' },
  { id: 'mel', city: 'Melbourne', country: 'Australia', tz: 'Australia/Melbourne', code: 'AEST/AEDT' },
  { id: 'del', city: 'New Delhi / Mumbai', country: 'India', tz: 'Asia/Kolkata', code: 'IST' },
  { id: 'dxb', city: 'Dubai', country: 'United Arab Emirates', tz: 'Asia/Dubai', code: 'GST' },
  { id: 'jnb', city: 'Johannesburg', country: 'South Africa', tz: 'Africa/Johannesburg', code: 'SAST' },
  { id: 'cai', city: 'Cairo', country: 'Egypt', tz: 'Africa/Cairo', code: 'EET' },
  { id: 'akl', city: 'Auckland', country: 'New Zealand', tz: 'Pacific/Auckland', code: 'NZST/NZDT' },
  { id: 'hnl', city: 'Honolulu', country: 'Hawaii, US', tz: 'Pacific/Honolulu', code: 'HST' },
];

export const WorldClockConverter: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [pinnedZones, setPinnedZones] = useState<string[]>([
    'utc', 'lon', 'nyc', 'lax', 'han', 'sin', 'tok', 'syd'
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Source time customizer
  const [sourceHour, setSourceHour] = useState<number>(new Date().getHours());

  const handleHourChange = (newHour: number) => {
    setSourceHour(newHour);
    const d = new Date(selectedDate);
    d.setHours(newHour);
    setSelectedDate(d);
  };

  const formatTzTime = (tz: string, date: Date) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(date);
    } catch {
      return 'N/A';
    }
  };

  const formatTzDate = (tz: string, date: Date) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch {
      return 'N/A';
    }
  };

  const getTzOffsetString = (tz: string, date: Date) => {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        timeZoneName: 'shortOffset'
      }).formatToParts(date);
      const tzPart = parts.find(p => p.type === 'timeZoneName');
      return tzPart ? tzPart.value : '';
    } catch {
      return '';
    }
  };

  const togglePin = (id: string) => {
    if (pinnedZones.includes(id)) {
      setPinnedZones(pinnedZones.filter(z => z !== id));
    } else {
      setPinnedZones([...pinnedZones, id]);
    }
  };

  const activeZoneItems = ALL_ZONES.filter(z => pinnedZones.includes(z.id));
  const filteredAvailable = ALL_ZONES.filter(
    z => !pinnedZones.includes(z.id) &&
      (z.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
       z.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
       z.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col h-full space-y-4">
      {/* Top Controls Bar */}
      <div className="card-3d p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center text-orange-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[var(--text-secondary)]">Timezone Converter & Global Team Planner</div>
            <div className="text-sm font-semibold text-[var(--text-primary)]">
              Reference Time: <span className="text-orange-400 font-mono">{selectedDate.toLocaleTimeString()}</span> ({Intl.DateTimeFormat().resolvedOptions().timeZone})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedDate(new Date());
              setSourceHour(new Date().getHours());
            }}
            className="btn-3d px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            Reset to Current Time
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(!showAddModal)}
            className={`btn-3d flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
              showAddModal ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-orange-400" />
            <span>Add City</span>
          </button>
        </div>
      </div>

      {/* Add City Modal / Drawer */}
      {showAddModal && (
        <div className="card-3d p-4 rounded-xl space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-primary)]">Add Timezone to Watchlist</span>
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city or country..."
                className="input-3d w-full pl-8 pr-3 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-auto well-3d p-2 rounded-xl">
            {filteredAvailable.map((zone) => (
              <button
                key={zone.id}
                type="button"
                onClick={() => togglePin(zone.id)}
                className="p-2 rounded-lg bg-[var(--control-panel-bg)] hover:bg-orange-500/20 text-left text-xs transition cursor-pointer flex flex-col justify-between"
              >
                <span className="font-medium text-[var(--text-primary)] truncate">{zone.city}</span>
                <span className="text-[10px] text-[var(--text-muted)] truncate">{zone.country} ({zone.code})</span>
              </button>
            ))}
            {filteredAvailable.length === 0 && (
              <div className="col-span-full p-4 text-center text-xs text-[var(--text-muted)]">
                All available timezones are already pinned or no match found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 24-Hour Slider for Team Meeting Planning */}
      <div className="card-3d p-4 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>Time Slider (Drag to test overlap hours)</span>
          <span className="font-mono text-orange-400 font-semibold">{String(sourceHour).padStart(2, '0')}:00 Local</span>
        </div>
        <input
          type="range"
          min={0}
          max={23}
          value={sourceHour}
          onChange={(e) => handleHourChange(Number(e.target.value))}
          className="w-full accent-orange-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono">
          <span>00:00 (Midnight)</span>
          <span>06:00 (Morning)</span>
          <span>12:00 (Noon)</span>
          <span>18:00 (Evening)</span>
          <span>23:00</span>
        </div>
      </div>

      {/* Pinned Timezones Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 flex-1">
        {activeZoneItems.map((item) => {
          const timeStr = formatTzTime(item.tz, selectedDate);
          const dateStr = formatTzDate(item.tz, selectedDate);
          const offsetStr = getTzOffsetString(item.tz, selectedDate);

          // Working hours indicator (9:00 - 18:00)
          const hourNum = parseInt(timeStr.split(':')[0], 10);
          const isWorkHour = hourNum >= 9 && hourNum < 18;

          return (
            <div
              key={item.id}
              className="card-3d p-4 rounded-xl space-y-2 flex flex-col justify-between hover:scale-[1.01] transition relative group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">{item.city}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">{item.country}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isWorkHour ? 'bg-emerald-500/15 text-emerald-400' : 'bg-[var(--control-panel-bg)] text-[var(--text-muted)]'
                  }`}>
                    {isWorkHour ? 'Working' : 'Off-hours'}
                  </span>
                  <button
                    type="button"
                    onClick={() => togglePin(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-rose-400 p-1 transition cursor-pointer"
                    title="Remove from list"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="my-1">
                <div className="text-2xl font-mono font-bold text-orange-400 tracking-wider">
                  {timeStr}
                </div>
                <div className="text-xs text-[var(--text-secondary)] font-mono">
                  {dateStr}
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--well-header-bg)]/40 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span className="font-mono">{offsetStr}</span>
                <CopyButton text={`${item.city}: ${timeStr} ${dateStr} (${offsetStr})`} label="Copy" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
