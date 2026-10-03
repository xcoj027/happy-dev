/** HappyDev - Offline Developer Utilities Suite
 * @author TNQSW
 * @license MIT (with Trademark Retention Notice)
 * Copyright (c) 2026 TNQSW. Retain TNQ trademark, author credits and notices.
 */
export type Schedule = 'minutes' | 'hours' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export interface ScheduleOptions {
  schedule: Schedule;
  interval: number;
  hour: number;
  minute: number;
  days: number[];
  day: number;
  month: number;
  lastDay: boolean;
  seconds: boolean;
}
export const defaultSchedule: ScheduleOptions = {
  schedule: 'minutes', interval: 15, hour: 9, minute: 0, days: [1, 2, 3, 4, 5],
  day: 1, month: 1, lastDay: false, seconds: false,
};
export function buildSchedule(options: ScheduleOptions): string {
  const { schedule, interval, hour, minute, day, month, lastDay, seconds } = options;
  const valid = (value: number, min: number, max: number, name: string) => {
    if (!Number.isInteger(value) || value < min || value > max) throw new Error(`${name} must be between ${min} and ${max}.`);
  };
  valid(minute, 0, 59, 'Minute');
  valid(hour, 0, 23, 'Hour');
  valid(day, 1, 31, 'Day');
  valid(month, 1, 12, 'Month');
  let expression: string;
  switch (schedule) {
    case 'minutes': valid(interval, 1, 59, 'Interval'); expression = `*/${interval} * * * *`; break;
    case 'hours': valid(interval, 1, 23, 'Interval'); expression = `${minute} */${interval} * * *`; break;
    case 'daily': expression = `${minute} ${hour} * * *`; break;
    case 'weekly': {
      const days = [...new Set(options.days)].sort((a, b) => a - b);
      if (!days.length) throw new Error('Select at least one weekday.');
      days.forEach(value => valid(value, 0, 6, 'Weekday'));
      expression = `${minute} ${hour} * * ${days.join(',')}`;
      break;
    }
    case 'monthly': expression = `${minute} ${hour} ${lastDay ? 'L' : day} * *`; break;
    case 'yearly': expression = `${minute} ${hour} ${day} ${month} *`; break;
  }
  return seconds ? `0 ${expression}` : expression;
}
export const cronFields = [
  { name: 'Second', min: 0, max: 59 },
  { name: 'Minute', min: 0, max: 59 },
  { name: 'Hour', min: 0, max: 23 },
  { name: 'Day of month', min: 1, max: 31 },
  { name: 'Month', min: 1, max: 12 },
  { name: 'Day of week', min: 0, max: 7 },
];
export const cronPresets = [
  { label: 'Every minute', expr: '* * * * *' },
  { label: 'Every 5 minutes', expr: '*/5 * * * *' },
  { label: 'Every 15 minutes', expr: '*/15 * * * *' },
  { label: 'Hourly', expr: '0 * * * *' },
  { label: 'Every 6 hours', expr: '0 */6 * * *' },
  { label: 'Daily midnight', expr: '0 0 * * *' },
  { label: 'Weekdays at 9 AM', expr: '0 9 * * 1-5' },
  { label: 'Weekends at 10 AM', expr: '0 10 * * 0,6' },
  { label: 'Monthly', expr: '0 0 1 * *' },
  { label: 'Last day of month', expr: '0 0 L * *' },
  { label: 'First Monday', expr: '0 9 * * 1#1' },
  { label: 'Yearly', expr: '0 0 1 1 *' },
  { label: 'Every 30 seconds', expr: '*/30 * * * * *' },
];
