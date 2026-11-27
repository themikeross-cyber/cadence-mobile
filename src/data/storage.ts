import AsyncStorage from '@react-native-async-storage/async-storage';

import { todayKey } from './dates';
import { defaultSettings, type AppSettings, type RepeatRule, type Task, type ThemeChoice } from './types';

const TASKS_KEY = 'tasks';
const SETTINGS_KEY = 'cadence-settings';

type LegacyTask = {
  id?: string;
  title?: string;
  notes?: string;
  completedToday?: boolean;
  scheduledDate?: string;
  completedDates?: string[];
  repeat?: RepeatRule;
  scheduledTime?: string;
};

function isRepeat(value: unknown): value is RepeatRule {
  return value === 'none' || value === 'daily' || value === 'weekdays';
}

function isTheme(value: unknown): value is ThemeChoice {
  return value === 'dark' || value === 'light' || value === 'system';
}

export function migrateTask(raw: LegacyTask): Task | null {
  if (!raw || typeof raw.title !== 'string' || raw.title.trim() === '') {
    return null;
  }
  const today = todayKey();
  const scheduledDate =
    typeof raw.scheduledDate === 'string' ? raw.scheduledDate : today;
  const completedDates = Array.isArray(raw.completedDates)
    ? raw.completedDates.filter((date) => typeof date === 'string')
    : raw.completedToday
      ? [today]
      : [];

  return {
    id: typeof raw.id === 'string' ? raw.id : `${Date.now()}`,
    title: raw.title.trim(),
    notes: typeof raw.notes === 'string' && raw.notes.trim() ? raw.notes.trim() : undefined,
    scheduledDate,
    completedDates,
    repeat: isRepeat(raw.repeat) ? raw.repeat : 'none',
    scheduledTime:
      typeof raw.scheduledTime === 'string' ? raw.scheduledTime : undefined,
  };
}

function migrateSettings(raw: Partial<AppSettings> | null): AppSettings {
  if (!raw) {
    return defaultSettings;
  }
  return {
    theme: isTheme(raw.theme) ? raw.theme : defaultSettings.theme,
    reminderEnabled:
      typeof raw.reminderEnabled === 'boolean'
        ? raw.reminderEnabled
        : defaultSettings.reminderEnabled,
    reminderHour:
      typeof raw.reminderHour === 'number' ? raw.reminderHour : defaultSettings.reminderHour,
    reminderMinute:
      typeof raw.reminderMinute === 'number'
        ? raw.reminderMinute
        : defaultSettings.reminderMinute,
    skippedDays: Array.isArray(raw.skippedDays)
      ? raw.skippedDays.filter((day) => typeof day === 'string')
      : [],
  };
}

export async function loadStore() {
  const [taskJson, settingsJson] = await Promise.all([
    AsyncStorage.getItem(TASKS_KEY),
    AsyncStorage.getItem(SETTINGS_KEY),
  ]);

  let tasks: Task[] = [];
  if (taskJson) {
    const parsed = JSON.parse(taskJson) as LegacyTask[];
    tasks = parsed.map(migrateTask).filter((task): task is Task => task !== null);
  }

  const settings = migrateSettings(
    settingsJson ? (JSON.parse(settingsJson) as Partial<AppSettings>) : null,
  );

  return { tasks, settings };
}

export async function saveTasks(tasks: Task[]) {
  await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export async function saveSettings(settings: AppSettings) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
