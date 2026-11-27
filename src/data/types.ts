export type RepeatRule = 'none' | 'daily' | 'weekdays';

export type ThemeChoice = 'dark' | 'light' | 'system';

export type Task = {
  id: string;
  title: string;
  notes?: string;
  scheduledDate: string;
  completedDates: string[];
  repeat: RepeatRule;
  scheduledTime?: string;
};

export type TaskDraft = {
  title: string;
  notes?: string;
  scheduledDate: string;
  repeat: RepeatRule;
  scheduledTime?: string;
};

export type AppSettings = {
  theme: ThemeChoice;
  reminderHour: number;
  reminderMinute: number;
  skippedDays: string[];
};

export const defaultSettings: AppSettings = {
  theme: 'dark',
  reminderHour: 8,
  reminderMinute: 0,
  skippedDays: [],
};
