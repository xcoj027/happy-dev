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
import React, { useEffect, useMemo, useRef, useState } from 'react';
import cronstrue from 'cronstrue';
import { CronExpressionParser } from 'cron-parser';
import { CopyButton } from '../../components/common/CopyButton';
import { buildSchedule, cronFields, cronPresets, defaultSchedule, ScheduleOptions } from '../../lib/cronBuilder';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const control = 'input-3d rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-primary)]';
const button = 'btn-3d rounded-lg px-3 py-1.5 text-xs cursor-pointer';

const FieldControl: React.FC<{ index: number; value: string; onChange: (value: string) => void }> = ({ index, value, onChange }) => {
  const field = cronFields[index];
  const inferMode = (text: string) => text === '*' ? 'every' : text.startsWith('*/') ? 'step' : /^\d*-\d*$/.test(text) ? 'range' : 'custom';
  const [mode, setMode] = useState(inferMode(value));
  const lastValue = useRef(value);
  useEffect(() => {
    if (value !== lastValue.current) { setMode(inferMode(value)); lastValue.current = value; }
  }, [value]);
  const update = (next: string) => { lastValue.current = next; onChange(next); };
  const range = value.split('-');
  return (
    <div className="well-3d p-3 rounded-xl space-y-2">
      <label htmlFor={`cron-field-${index}`} className="block text-xs font-medium text-[var(--text-secondary)]">{field.name} ({field.min}–{field.max})</label>
      <select id={`cron-field-${index}`} className={`${control} w-full`} value={mode} onChange={e => { setMode(e.target.value); update(e.target.value === 'every' ? '*' : e.target.value === 'step' ? '*/2' : e.target.value === 'range' ? `${field.min}-${field.max}` : String(field.min)); }}>
        <option value="every">Every value (*)</option><option value="step">Every N values</option><option value="range">Range</option><option value="custom">Values / expression</option>
      </select>
      {mode === 'step' && <input aria-label={`${field.name} interval`} type="number" min="1" max={field.max} className={`${control} w-full`} value={value.slice(2)} onChange={e => update(`*/${e.target.value}`)} />}
      {mode === 'range' && <div className="flex gap-2">
        <input aria-label={`${field.name} range start`} type="number" min={field.min} max={field.max} className={`${control} w-full min-w-0`} value={range[0]} onChange={e => update(`${e.target.value}-${range[1]}`)} />
        <input aria-label={`${field.name} range end`} type="number" min={field.min} max={field.max} className={`${control} w-full min-w-0`} value={range[1]} onChange={e => update(`${range[0]}-${e.target.value}`)} />
      </div>}
      {mode === 'custom' && <TextInput aria-label={`${field.name} values`} className={`${control} w-full font-mono`} value={value} onChange={e => update(e.target.value || '*')} placeholder="e.g. 1,5,10" />}
      <div className="font-mono text-xs text-emerald-600 dark:text-emerald-400">{value}</div>
    </div>
  );
};

export const CronParser: React.FC = () => {
  const [cronExpr, setCronExpr] = useState('*/15 * * * *');
  const [mode, setMode] = useState<'schedule' | 'fields' | 'expression'>('schedule');
  const [schedule, setSchedule] = useState<ScheduleOptions>(defaultSchedule);
  const [builderError, setBuilderError] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const [reference, setReference] = useState('');
  const [anchor, setAnchor] = useState(() => new Date());
  const [runCount, setRunCount] = useState(10);
  const [command, setCommand] = useState('');
  const zones = useMemo(() => [...new Set(['UTC', Intl.DateTimeFormat().resolvedOptions().timeZone, ...Intl.supportedValuesOf('timeZone')])].sort(), []);
  const parts = cronExpr.trim().split(/\s+/);
  const isFields = parts.length === 5 || parts.length === 6;
  const offset = parts.length === 6 ? 0 : 1;
  const updateSchedule = (patch: Partial<ScheduleOptions>) => {
    const next = { ...schedule, ...patch };
    setSchedule(next);
    try { setCronExpr(buildSchedule(next)); setBuilderError(''); }
    catch (cause) { setBuilderError(cause instanceof Error ? cause.message : 'Invalid schedule.'); }
  };
  const setExpression = (value: string) => { setCronExpr(value); setBuilderError(''); };
  const preview = useMemo(() => {
    try {
      if (!cronExpr.trim()) throw new Error('Enter a cron expression.');
      if (!isFields && !cronExpr.trim().startsWith('@')) throw new Error('Use 5 fields (Unix) or 6 fields (with seconds).');
      new Intl.DateTimeFormat('en', { timeZone: timezone }).format(anchor);
      const currentDate = reference ? new Date(reference) : anchor;
      if (Number.isNaN(currentDate.getTime())) throw new Error('Enter a valid ISO reference date with a timezone, e.g. 2026-10-03T09:00:00+07:00.');
      if (reference && !/(Z|[+-]\d{2}:\d{2})$/i.test(reference.trim())) throw new Error('Include Z or a UTC offset in the reference date.');
      const interval = CronExpressionParser.parse(cronExpr.trim(), { tz: timezone, currentDate });
      const normalized = interval.stringify(parts.length === 6);
      const description = cronstrue.toString(normalized, { use24HourTimeFormat: true });
      const runs = Array.from({ length: runCount }, () => interval.next().toDate());
      const fields = normalized.split(' ');
      const dayOffset = fields.length === 6 ? 1 : 0;
      const bothDays = fields[2 + dayOffset] !== '*' && fields[4 + dayOffset] !== '*';
      return { description, runs, error: '', normalized, bothDays };
    } catch (cause) {
      return { description: '', runs: [], error: cause instanceof Error ? cause.message : 'Invalid cron expression.', normalized: '', bothDays: false };
    }
  }, [cronExpr, timezone, reference, anchor, runCount, isFields]);
  const unixExpression = preview.normalized.split(' ').length === 5 ? preview.normalized : '';
  const exportError = !unixExpression ? 'Crontab export requires 5 fields. Switch off seconds or use a 5-field expression.' : /[\r\n]/.test(command) ? 'Use a single-line command.' : unixExpression.includes('L') || unixExpression.includes('#') ? 'L and # are scheduler extensions and are not supported by standard Unix crontab.' : '';
  const job = command.trim() && !preview.error && !builderError && !exportError ? `${unixExpression} ${command.trim().replace(/(?<!\\)%/g, '\\%')}` : '';

  return (
    <div className="space-y-4">
      <div className="card-3d rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Cron creation mode">
          {(['schedule', 'fields', 'expression'] as const).map(value => <button type="button" key={value} aria-pressed={mode === value} className={`${button} ${mode === value ? 'btn-3d-active' : ''}`} onClick={() => setMode(value)}>{value === 'schedule' ? 'Quick schedule' : value === 'fields' ? 'Field builder' : 'Expression editor'}</button>)}
        </div>
        <div className="flex flex-wrap gap-2">
          {cronPresets.map(preset => <button type="button" key={preset.label} className={`${button} ${cronExpr === preset.expr ? 'btn-3d-active' : ''}`} onClick={() => { setExpression(preset.expr); setMode('fields'); }}>{preset.label}</button>)}
        </div>
      </div>

      {mode === 'schedule' && <div className="card-3d rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
          <label className="flex items-center gap-2">Frequency
            <select className={control} value={schedule.schedule} onChange={e => updateSchedule({ schedule: e.target.value as ScheduleOptions['schedule'], interval: Math.min(schedule.interval, e.target.value === 'hours' ? 23 : 59) })}>
              <option value="minutes">Every N minutes</option><option value="hours">Every N hours</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option>
            </select>
          </label>
          {['minutes', 'hours'].includes(schedule.schedule) && <label className="flex items-center gap-2">Every
            <input type="number" min="1" max={schedule.schedule === 'minutes' ? 59 : 23} className={`${control} w-20`} value={schedule.interval} onChange={e => updateSchedule({ interval: Number(e.target.value) })} />{schedule.schedule === 'minutes' ? 'minutes' : 'hours'}
          </label>}
          {schedule.schedule !== 'minutes' && <>
            {schedule.schedule !== 'hours' && <label className="flex items-center gap-2">Hour <input type="number" min="0" max="23" className={`${control} w-20`} value={schedule.hour} onChange={e => updateSchedule({ hour: Number(e.target.value) })} /></label>}
            <label className="flex items-center gap-2">Minute <input type="number" min="0" max="59" className={`${control} w-20`} value={schedule.minute} onChange={e => updateSchedule({ minute: Number(e.target.value) })} /></label>
          </>}
          {['monthly', 'yearly'].includes(schedule.schedule) && <label className="flex items-center gap-2">Day <input type="number" min="1" max="31" disabled={schedule.schedule === 'monthly' && schedule.lastDay} className={`${control} w-20`} value={schedule.day} onChange={e => updateSchedule({ day: Number(e.target.value) })} /></label>}
          {schedule.schedule === 'monthly' && <label className="flex items-center gap-2"><input type="checkbox" checked={schedule.lastDay} onChange={e => updateSchedule({ lastDay: e.target.checked })} />Last day of month (L)</label>}
          {schedule.schedule === 'yearly' && <label className="flex items-center gap-2">Month <select className={control} value={schedule.month} onChange={e => updateSchedule({ month: Number(e.target.value) })}>{Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2026, i, 1)))}</option>)}</select></label>}
          <label className="flex items-center gap-2"><input type="checkbox" checked={schedule.seconds} onChange={e => updateSchedule({ seconds: e.target.checked })} />Include seconds (6 fields)</label>
          <button type="button" className={button} onClick={() => updateSchedule({})}>Apply schedule</button>
        </div>
        {schedule.schedule === 'weekly' && <div className="flex flex-wrap gap-2">{weekdays.map((day, index) => <button type="button" key={day} aria-pressed={schedule.days.includes(index)} className={`${button} ${schedule.days.includes(index) ? 'btn-3d-active' : ''}`} onClick={() => updateSchedule({ days: schedule.days.includes(index) ? schedule.days.filter(value => value !== index) : [...schedule.days, index] })}>{day}</button>)}</div>}
        <p className="text-xs text-[var(--text-muted)]">Changes generate an expression immediately. Minute and hour steps restart at each hour or day. Dates such as the 31st skip months without that date.</p>
      </div>}

      {mode === 'fields' && <div className="card-3d rounded-xl p-4 space-y-3">
        <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><input type="checkbox" checked={parts.length === 6} disabled={!isFields} onChange={e => setExpression(e.target.checked ? `0 ${cronExpr.trim()}` : parts.slice(1).join(' '))} />Include seconds</label>
        {isFields ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{parts.map((value, index) => <FieldControl key={index + offset} index={index + offset} value={value} onChange={next => { const updated = [...parts]; updated[index] = next; setExpression(updated.join(' ')); }} />)}</div> : <p className="text-xs text-[var(--text-secondary)]">Choose a preset or enter 5 or 6 fields to use the builder. {preview.normalized && <button type="button" className={button} onClick={() => setExpression(preview.normalized)}>Expand shorthand</button>}</p>}
        <p className="text-xs text-[var(--text-muted)]">Use commas for lists, hyphens for ranges, / for steps, L for the last day, and # for the nth weekday. Sunday is 0 or 7. Support varies by scheduler.</p>
      </div>}

      <div className="card-3d rounded-xl p-4 space-y-3">
        <label htmlFor="cron-expression" className="block text-xs font-medium text-[var(--text-secondary)]">Cron expression · 5 fields (Unix) or 6 fields (with seconds)</label>
        <div className="flex items-center gap-2"><TextInput id="cron-expression" value={cronExpr} maxLength={200} onChange={e => { setExpression(e.target.value); setMode('expression'); }} className={`${control} flex-1 min-w-0 font-mono text-base`} /><CopyButton text={cronExpr} /></div>
        {isFields && <div className="flex flex-wrap gap-2">{parts.map((value, index) => <div key={index} className="well-3d rounded-lg px-3 py-2 text-xs"><span className="text-[var(--text-muted)]">{cronFields[index + offset].name}</span><div className="font-mono text-[var(--text-primary)]">{value}</div></div>)}</div>}
        {(builderError || preview.error) ? <div role="alert" className="rounded-lg p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs">{builderError || preview.error}</div> : <div className="rounded-lg p-3 bg-emerald-500/10 text-[var(--text-primary)]">{preview.description}<span className="block mt-1 text-xs text-[var(--text-secondary)]">In {timezone}</span></div>}
        {preview.bothDays && <p className="text-xs text-amber-600 dark:text-amber-400">Both day of month and day of week are restricted. This preview uses Unix OR behavior: either day rule can trigger a run.</p>}
      </div>

      <div className="card-3d rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-end gap-3 text-xs text-[var(--text-secondary)]">
          <label className="space-y-1"><span className="block">Timezone</span><TextInput aria-label="Timezone" list="cron-timezones" className={control} value={timezone} onChange={e => setTimezone(e.target.value)} /><datalist id="cron-timezones">{zones.map(zone => <option key={zone} value={zone} />)}</datalist></label>
          <label className="space-y-1 flex-1 min-w-48"><span className="block">Preview after (ISO date with offset; blank = refreshed time)</span><TextInput className={`${control} w-full`} value={reference} onChange={e => setReference(e.target.value)} placeholder="2026-10-03T09:00:00+07:00" /></label>
          <label className="space-y-1"><span className="block">Runs</span><select className={control} value={runCount} onChange={e => setRunCount(Number(e.target.value))}>{[5, 10, 20].map(count => <option key={count}>{count}</option>)}</select></label>
          <button type="button" className={button} onClick={() => { setReference(''); setAnchor(new Date()); }}>Refresh from now</button>
        </div>
        <p className="text-xs text-[var(--text-muted)]">Timezone and daylight-saving rules apply to the preview. Configure the same timezone in your scheduler.</p>
        {!preview.error && !builderError && <ol className="space-y-2">{preview.runs.map((date, index) => {
          const display = new Intl.DateTimeFormat('en-GB', { timeZone: timezone, dateStyle: 'medium', timeStyle: 'long' }).format(date);
          return <li key={date.toISOString()} className="well-3d rounded-lg px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs"><span className="font-mono text-[var(--text-primary)]">#{index + 1} {display}<span className="block text-[var(--text-muted)]">{date.toISOString()}</span></span><CopyButton text={date.toISOString()} /></li>;
        })}</ol>}
      </div>

      <div className="card-3d rounded-xl p-4 space-y-3">
        <label htmlFor="cron-command" className="block text-xs font-medium text-[var(--text-secondary)]">Create a user crontab entry</label>
        <TextInput id="cron-command" className={`${control} w-full font-mono`} value={command} onChange={e => setCommand(e.target.value)} placeholder="/usr/bin/java -jar /opt/jobs/task.jar >> /var/log/task.log 2>&1" />
        {exportError && <p className="text-xs text-[var(--text-muted)]">{exportError}</p>}
        {job && <div className="well-3d rounded-lg p-3 flex items-start gap-2"><code className="flex-1 min-w-0 break-all text-xs text-[var(--text-primary)]">{job}</code><CopyButton text={job} /></div>}
        <p className="text-xs text-[var(--text-muted)]">Copy the entry into crontab -e on your target machine. Use absolute paths and configure its timezone. Percent signs are escaped for crontab.</p>
      </div>
    </div>
  );
};
