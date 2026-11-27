import type { RepeatRule, Task } from './types';

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayKey() {
  return toDateKey(new Date());
}

export function parseDateKey(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function dateAtTime(dateKey: string, time: string) {
  const date = parseDateKey(dateKey);
  const [hour, minute] = time.split(':').map(Number);
  date.setHours(hour, minute, 0, 0);
  return date;
}

export function addDays(key: string, amount: number) {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + amount);
  return toDateKey(date);
}

export function isWeekday(key: string) {
  const day = parseDateKey(key).getDay();
  return day !== 0 && day !== 6;
}

export function occursOn(task: Task, dateKey: string) {
  if (dateKey < task.scheduledDate) {
    return false;
  }
  if (task.repeat === 'none') {
    return dateKey === task.scheduledDate;
  }
  if (task.repeat === 'weekdays') {
    return isWeekday(dateKey);
  }
  return true;
}

export function isCompleteOn(task: Task, dateKey: string) {
  return task.completedDates.includes(dateKey);
}

export function tasksOnDate(tasks: Task[], dateKey: string) {
  return tasks.filter((task) => occursOn(task, dateKey));
}

export function formatMonth(date: Date) {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function formatLongDate(key: string) {
  return parseDateKey(key).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function formatShortDate(key: string) {
  return parseDateKey(key).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatWeekday(key: string) {
  return parseDateKey(key).toLocaleDateString(undefined, { weekday: 'narrow' });
}

export function formatClock(hour: number, minute: number) {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

export function formatScheduledTime(value?: string) {
  if (!value) {
    return 'No time';
  }
  const [hour, minute] = value.split(':').map(Number);
  return formatClock(hour, minute);
}

export function repeatLabel(repeat: RepeatRule, scheduledDate: string) {
  if (repeat === 'daily') {
    return `Every day from ${formatShortDate(scheduledDate)}`;
  }
  if (repeat === 'weekdays') {
    return `Weekdays from ${formatShortDate(scheduledDate)}`;
  }
  return formatLongDate(scheduledDate);
}

export function upcomingDates(task: Task, count = 6) {
  if (task.repeat === 'none') {
    return [task.scheduledDate];
  }
  const dates: string[] = [];
  let cursor = task.scheduledDate;
  for (let step = 0; step < 370 && dates.length < count; step += 1) {
    if (occursOn(task, cursor)) {
      dates.push(cursor);
    }
    cursor = addDays(cursor, 1);
  }
  return dates;
}

export function monthCells(year: number, month: number) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: Array<string | null> = [];
  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= days; day += 1) {
    cells.push(toDateKey(new Date(year, month, day)));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

export function shiftMonth(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}
