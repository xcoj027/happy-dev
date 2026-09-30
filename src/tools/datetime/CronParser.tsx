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
import cronstrue from 'cronstrue';
import { CronExpressionParser } from 'cron-parser';
import { CopyButton } from '../../components/common/CopyButton';
import { Clock, Calendar, AlertCircle } from 'lucide-react';

const PRESETS = [
  { label: 'Every 5m', expr: '*/5 * * * *' },
  { label: 'Every 15m', expr: '*/15 * * * *' },
  { label: 'Hourly', expr: '0 * * * *' },
  { label: 'Daily Midnight', expr: '0 0 * * *' },
  { label: 'Mon-Fri 9 AM', expr: '0 9 * * 1-5' },
];

export const CronParser: React.FC = () => {
  const [cronExpr, setCronExpr] = useState('*/15 * * * *');

  let humanText = '';
  let nextRuns: string[] = [];
  let error: string | null = null;

  if (cronExpr.trim()) {
    try {
      humanText = cronstrue.toString(cronExpr.trim(), { use24HourTimeFormat: true });
      const interval = CronExpressionParser.parse(cronExpr.trim());
      for (let i = 0; i < 5; i++) {
        const obj = interval.next();
        nextRuns.push(obj.toDate().toLocaleString() + ` (${obj.toDate().toISOString()})`);
      }
    } catch (err: any) {
      error = err.message || 'Invalid Cron expression';
    }
  }

  return (
    <div className="space-y-4">
      {/* Expression input card */}
      <div className="p-4 card-3d rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs text-[var(--text-secondary)] font-medium">Cron Expression (5 or 6 fields)</label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setCronExpr(p.expr)}
                className={`btn-3d px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer ${
                  cronExpr === p.expr ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={cronExpr}
            maxLength={100}
            onChange={(e) => setCronExpr(e.target.value)}
            className="input-3d flex-1 px-3 py-2 text-base font-mono text-emerald-600 dark:text-emerald-400 outline-none rounded-lg font-bold"
            placeholder="* * * * *"
          />
          <CopyButton text={cronExpr} />
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 dark:text-rose-400 text-xs font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1">
          <div className="text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
            Human Readable Meaning
          </div>
          <div className="text-base font-medium text-[var(--text-primary)]">
            “ {humanText} ”
          </div>
        </div>
      )}

      {/* Next Execution Times */}
      {nextRuns.length > 0 && !error && (
        <div className="p-4 card-3d rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-500" />
              Next 5 Calculated Executions
            </span>
          </div>
          <div className="space-y-1.5">
            {nextRuns.map((r, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-1.5 well-3d rounded-lg text-xs font-mono text-[var(--text-primary)]"
              >
                <span>
                  <strong className="text-emerald-600 dark:text-emerald-400 mr-2">#{idx + 1}</strong> {r}
                </span>
                <CopyButton text={r} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
