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

import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  BellRing,
  BellOff,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  RotateCw,
  Volume2,
  VolumeX,
  Timer,
  Check,
} from 'lucide-react';

export type RepeatOption = 'none' | 'hourly' | 'daily' | 'weekdays' | 'weekends' | 'weekly';

export interface ReminderTask {
  id: string;
  title: string;
  targetTime: string; // ISO string e.g. "2026-09-30T15:30"
  repeat: RepeatOption;
  enabled: boolean;
  isCompleted: boolean;
  lastTriggered?: string;
  createdAt: string;
}

const STORAGE_KEY = 'happydev_task_reminders_v1';
const MAX_TASKS = 10;

/**
 * Synthesizes an offline chime tone using Web Audio API (no external mp3/assets needed)
 */
function playOfflineChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880, now + 0.12); // A5
    osc.frequency.setValueAtTime(1174.66, now + 0.24); // D6

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.65);
  } catch {}
}

export const TaskReminder: React.FC = () => {
  const [tasks, setTasks] = useState<ReminderTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.slice(0, MAX_TASKS);
      }
    } catch {}
    // Initial sample reminder
    const initialDue = new Date(Date.now() + 30 * 60 * 1000);
    const initialDueStr = new Date(initialDue.getTime() - initialDue.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    return [
      {
        id: 'task_sample_1',
        title: 'Review pull requests & update ticket status',
        targetTime: initialDueStr,
        repeat: 'daily',
        enabled: true,
        isCompleted: false,
        createdAt: new Date().toISOString(),
      },
    ];
  });

  // Form state
  const [title, setTitle] = useState('');
  const [targetTime, setTargetTime] = useState(() => {
    const d = new Date(Date.now() + 15 * 60 * 1000);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [repeat, setRepeat] = useState<RepeatOption>('none');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(() => {
    return typeof Notification !== 'undefined' ? Notification.permission : 'default';
  });

  // Active ringing task
  const [dueTask, setDueTask] = useState<ReminderTask | null>(null);

  // Persist tasks
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  // Request browser desktop notification permission
  const requestNotificationPermission = async () => {
    if (typeof Notification !== 'undefined') {
      try {
        const perm = await Notification.requestPermission();
        setNotifPermission(perm);
      } catch {}
    }
  };

  // Live timer tick to evaluate reminders (every 2 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      setTasks((prevTasks) => {
        let hasChanges = false;

        const updated = prevTasks.map((task) => {
          if (!task.enabled || task.isCompleted) return task;

          const due = new Date(task.targetTime);
          if (now >= due) {
            // Check if already triggered recently within this minute
            const nowMinute = now.toISOString().slice(0, 16);
            if (task.lastTriggered === nowMinute) return task;

            hasChanges = true;
            setDueTask(task);

            if (soundEnabled) {
              playOfflineChime();
            }

            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
              try {
                new Notification(`⏰ Dev Reminder: ${task.title}`, {
                  body: `Scheduled time reached. Repeat: ${task.repeat.toUpperCase()}`,
                });
              } catch {}
            }

            // Calculate next time if repeating
            let nextTargetTime = task.targetTime;
            let nextCompleted: boolean = task.isCompleted;

            if (task.repeat === 'none') {
              nextCompleted = true;
            } else {
              const nextDate = new Date(due);
              if (task.repeat === 'hourly') {
                nextDate.setHours(nextDate.getHours() + 1);
              } else if (task.repeat === 'daily') {
                nextDate.setDate(nextDate.getDate() + 1);
              } else if (task.repeat === 'weekdays') {
                nextDate.setDate(nextDate.getDate() + 1);
                while (nextDate.getDay() === 0 || nextDate.getDay() === 6) {
                  nextDate.setDate(nextDate.getDate() + 1);
                }
              } else if (task.repeat === 'weekends') {
                nextDate.setDate(nextDate.getDate() + 1);
                while (nextDate.getDay() !== 0 && nextDate.getDay() !== 6) {
                  nextDate.setDate(nextDate.getDate() + 1);
                }
              } else if (task.repeat === 'weekly') {
                nextDate.setDate(nextDate.getDate() + 7);
              }
              nextTargetTime = new Date(nextDate.getTime() - nextDate.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16);
            }

            return {
              ...task,
              targetTime: nextTargetTime,
              isCompleted: nextCompleted,
              lastTriggered: nowMinute,
            };
          }
          return task;
        });

        return hasChanges ? updated : prevTasks;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [soundEnabled]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (tasks.length >= MAX_TASKS) return;

    const newTask: ReminderTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: title.trim().slice(0, 150),
      targetTime,
      repeat,
      enabled: true,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    setTitle('');
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (dueTask?.id === id) setDueTask(null);
  };

  const handleToggleEnabled = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    );
  };

  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t))
    );
  };

  const handleSnooze = (id: string, minutes: number) => {
    const nextDate = new Date(Date.now() + minutes * 60 * 1000);
    const nextIso = new Date(nextDate.getTime() - nextDate.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, targetTime: nextIso, enabled: true, isCompleted: false } : t
      )
    );
    if (dueTask?.id === id) setDueTask(null);
  };

  // Quick preset time helpers
  const setQuickTime = (minutesFromNow: number) => {
    const target = new Date(Date.now() + minutesFromNow * 60 * 1000);
    const iso = new Date(target.getTime() - target.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setTargetTime(iso);
  };

  const setTomorrowMorning = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setTargetTime(iso);
  };

  const getRelativeTimeDisplay = (timeStr: string) => {
    const now = Date.now();
    const due = new Date(timeStr).getTime();
    const diffMs = due - now;

    if (diffMs <= 0) return 'Overdue / Due now';
    const diffMins = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `in ${diffDays}d ${diffHours % 24}h`;
    if (diffHours > 0) return `in ${diffHours}h ${diffMins % 60}m`;
    return `in ${diffMins} min${diffMins === 1 ? '' : 's'}`;
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Alert when a task rings */}
      {dueTask && (
        <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 animate-fade-in shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Reminder Due!
              </div>
              <div className="text-sm font-bold text-[var(--text-primary)]">
                {dueTask.title}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSnooze(dueTask.id, 5)}
              className="btn-3d px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
            >
              +5m Snooze
            </button>
            <button
              type="button"
              onClick={() => handleSnooze(dueTask.id, 15)}
              className="btn-3d px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
            >
              +15m Snooze
            </button>
            <button
              type="button"
              onClick={() => setDueTask(null)}
              className="btn-3d-active px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}

      {/* Global Toolbar: Sound and Desktop Notification Permissions */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 card-3d rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-500" />
            Task Reminders Scheduler
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
            {tasks.length}/{MAX_TASKS} tasks
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`btn-3d flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
              soundEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--text-secondary)]'
            }`}
            title={soundEnabled ? 'Chime sound enabled' : 'Chime sound muted'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Chime ON' : 'Chime Muted'}</span>
          </button>

          {/* Test Chime */}
          <button
            type="button"
            onClick={playOfflineChime}
            className="btn-3d px-2.5 py-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
            title="Test audio chime"
          >
            Test Chime
          </button>

          {/* Desktop Notification Request */}
          {notifPermission !== 'granted' && (
            <button
              type="button"
              onClick={requestNotificationPermission}
              className="btn-3d flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-amber-600 dark:text-amber-400 transition cursor-pointer"
              title="Enable OS Desktop Notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Allow Notifications</span>
            </button>
          )}
        </div>
      </div>

      {/* Task Creation Input Section */}
      <form onSubmit={handleAddTask} className="p-4 card-3d rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Create New Reminder (Max {MAX_TASKS})
          </span>
          {tasks.length >= MAX_TASKS && (
            <span className="text-xs text-rose-500 font-medium">
              Limit reached (10/10). Delete or complete tasks to add more.
            </span>
          )}
        </div>

        <div className="space-y-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={tasks.length >= MAX_TASKS}
            placeholder="What do you need to be reminded of? (e.g., Standup meeting, Push release, Deploy to staging)"
            className="w-full input-3d rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] outline-none"
            maxLength={150}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Reminder Date & Time Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[var(--text-secondary)] flex items-center gap-1">
                <Calendar className="w-3 h-3 text-cyan-500" />
                Reminder Time
              </label>
              <input
                type="datetime-local"
                value={targetTime}
                onChange={(e) => setTargetTime(e.target.value)}
                disabled={tasks.length >= MAX_TASKS}
                className="w-full input-3d rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-primary)] outline-none"
                required
              />
            </div>

            {/* Repeat Option */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[var(--text-secondary)] flex items-center gap-1">
                <RotateCw className="w-3 h-3 text-emerald-500" />
                Repeat Frequency
              </label>
              <select
                value={repeat}
                onChange={(e) => setRepeat(e.target.value as RepeatOption)}
                disabled={tasks.length >= MAX_TASKS}
                className="w-full input-3d rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-primary)] outline-none cursor-pointer"
              >
                <option value="none">Once (No repeat)</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily (Every day)</option>
                <option value="weekdays">Weekdays (Mon - Fri)</option>
                <option value="weekends">Weekends (Sat - Sun)</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            {/* Quick Offset Presets */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] flex items-center gap-1">
                <Timer className="w-3 h-3 text-amber-500" />
                Quick Set Time
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setQuickTime(15)}
                  disabled={tasks.length >= MAX_TASKS}
                  className="btn-3d px-2 py-1 rounded text-[11px] transition cursor-pointer"
                >
                  +15m
                </button>
                <button
                  type="button"
                  onClick={() => setQuickTime(30)}
                  disabled={tasks.length >= MAX_TASKS}
                  className="btn-3d px-2 py-1 rounded text-[11px] transition cursor-pointer"
                >
                  +30m
                </button>
                <button
                  type="button"
                  onClick={() => setQuickTime(60)}
                  disabled={tasks.length >= MAX_TASKS}
                  className="btn-3d px-2 py-1 rounded text-[11px] transition cursor-pointer"
                >
                  +1h
                </button>
                <button
                  type="button"
                  onClick={setTomorrowMorning}
                  disabled={tasks.length >= MAX_TASKS}
                  className="btn-3d px-2 py-1 rounded text-[11px] transition cursor-pointer"
                >
                  Tmrw 9am
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={!title.trim() || tasks.length >= MAX_TASKS}
            className="btn-3d-active inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task Reminder</span>
          </button>
        </div>
      </form>

      {/* Task List (Result Panel) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] px-1">
          <span className="font-semibold uppercase tracking-wider text-[11px]">
            Active & Scheduled Reminders ({tasks.filter((t) => !t.isCompleted).length} active)
          </span>
          {tasks.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Clear all task reminders?')) setTasks([]);
              }}
              className="text-rose-500 hover:text-rose-600 transition cursor-pointer text-xs"
            >
              Clear All
            </button>
          )}
        </div>

        {tasks.length === 0 ? (
          <div className="p-8 text-center well-3d rounded-xl space-y-2">
            <Clock className="w-8 h-8 text-[var(--text-secondary)] mx-auto opacity-50" />
            <div className="text-xs font-bold text-[var(--text-primary)]">No Reminders Set</div>
            <div className="text-[11px] text-[var(--text-secondary)] max-w-xs mx-auto">
              Add reminders above to keep track of tasks, deployments, pull requests, and meetings.
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {tasks.map((task) => {
              const due = new Date(task.targetTime);
              const isPast = Date.now() >= due.getTime();
              const repeatLabel =
                task.repeat === 'none'
                  ? 'Once'
                  : task.repeat === 'weekdays'
                  ? 'Mon-Fri'
                  : task.repeat === 'weekends'
                  ? 'Sat-Sun'
                  : task.repeat;

              return (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    task.isCompleted
                      ? 'bg-black/[0.02] dark:bg-white/[0.02] border-[var(--border-subtle)] opacity-60'
                      : !task.enabled
                      ? 'bg-black/[0.02] dark:bg-white/[0.02] border-[var(--border-subtle)] opacity-50'
                      : isPast
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'card-3d'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Checkbox Complete */}
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(task.id)}
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition cursor-pointer shrink-0 ${
                        task.isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-[var(--border-default)] hover:border-emerald-500'
                      }`}
                      title={task.isCompleted ? 'Mark as active' : 'Mark as completed'}
                    >
                      {task.isCompleted && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-semibold ${
                            task.isCompleted
                              ? 'line-through text-[var(--text-secondary)]'
                              : 'text-[var(--text-primary)]'
                          }`}
                        >
                          {task.title}
                        </span>

                        {/* Repeat Badge */}
                        <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {repeatLabel}
                        </span>

                        {/* Relative Time Badge */}
                        {!task.isCompleted && task.enabled && (
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                              isPast
                                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                                : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                            }`}
                          >
                            {getRelativeTimeDisplay(task.targetTime)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-[var(--text-secondary)] font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {due.toLocaleDateString()} {due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {/* Snooze Options */}
                    {!task.isCompleted && (
                      <button
                        type="button"
                        onClick={() => handleSnooze(task.id, 10)}
                        className="btn-3d px-2 py-1 rounded text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
                        title="Snooze reminder for 10 minutes"
                      >
                        +10m
                      </button>
                    )}

                    {/* Enable/Disable */}
                    <button
                      type="button"
                      onClick={() => handleToggleEnabled(task.id)}
                      className={`btn-3d p-1.5 rounded-lg transition cursor-pointer ${
                        task.enabled ? 'text-emerald-500' : 'text-[var(--text-secondary)]'
                      }`}
                      title={task.enabled ? 'Pause reminder' : 'Resume reminder'}
                    >
                      {task.enabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      className="btn-3d p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-rose-500 transition cursor-pointer"
                      title="Delete reminder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
