import { addDays, isCompleteOn, tasksOnDate, todayKey } from './dates';
import type { Task } from './types';

export type DayState = 'empty' | 'open' | 'done' | 'miss' | 'skipped';

export function dayState(
  tasks: Task[],
  skippedDays: string[],
  dateKey: string,
  today = todayKey(),
): DayState {
  if (skippedDays.includes(dateKey)) {
    return 'skipped';
  }
  const assigned = tasksOnDate(tasks, dateKey);
  if (assigned.length === 0) {
    return 'empty';
  }
  const finished = assigned.every((task) => isCompleteOn(task, dateKey));
  if (finished) {
    return 'done';
  }
  if (dateKey >= today) {
    return 'open';
  }
  return 'miss';
}

export function completionRate(tasks: Task[], dateKey: string) {
  const assigned = tasksOnDate(tasks, dateKey);
  if (assigned.length === 0) {
    return 0;
  }
  const done = assigned.filter((task) => isCompleteOn(task, dateKey)).length;
  return done / assigned.length;
}

export function currentStreak(tasks: Task[], skippedDays: string[]) {
  let cursor = todayKey();
  let count = 0;
  let usedFreeze = false;

  for (let step = 0; step < 800; step += 1) {
    const state = dayState(tasks, skippedDays, cursor);
    if (state === 'open' || state === 'empty') {
      cursor = addDays(cursor, -1);
      continue;
    }
    if (state === 'done' || state === 'skipped') {
      count += 1;
      cursor = addDays(cursor, -1);
      continue;
    }
    if (count === 0 || usedFreeze) {
      break;
    }
    usedFreeze = true;
    cursor = addDays(cursor, -1);
  }

  return { count, freezeAvailable: !usedFreeze };
}

export function lastSevenDays() {
  const today = todayKey();
  return Array.from({ length: 7 }, (_, index) => addDays(today, index - 6));
}
