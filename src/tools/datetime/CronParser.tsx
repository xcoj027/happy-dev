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

export const CronParser: React.FC = () => {
  const [cronExpr, setCronExpr] = useState('');

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
      <div className="p-4 bg-gray-900/60 rounded-xl border border-gray-800 space-y-3">
        <label className="text-xs text-gray-400 font-medium">Cron Expression (5 or 6 fields)</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={cronExpr}
            onChange={(e) => setCronExpr(e.target.value)}
            className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-base font-mono text-emerald-400 outline-none focus:border-emerald-500 font-bold"
            placeholder="* * * * *"
          />
          <CopyButton text={cronExpr} />
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1">
          <div className="text-[11px] uppercase tracking-wider text-emerald-500 font-semibold">
            Human Readable Meaning
          </div>
          <div className="text-base font-medium text-emerald-300">
            “ {humanText} ”
          </div>
        </div>
      )}

      {/* Next Execution Times */}
      {nextRuns.length > 0 && !error && (
        <div className="p-4 bg-gray-900/60 rounded-xl border border-gray-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-300 font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              Next 5 Calculated Executions
            </span>
          </div>
          <div className="space-y-1.5">
            {nextRuns.map((r, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-1.5 bg-gray-950/70 border border-gray-800/80 rounded-lg text-xs font-mono text-gray-300"
              >
                <span>
                  <strong className="text-emerald-400 mr-2">#{idx + 1}</strong> {r}
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
