import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  cancelDailyReminder,
  scheduleDailyReminder,
  syncTaskNotifications,
} from '../notifications';
import { loadStore, saveSettings, saveTasks } from './storage';
import {
  defaultSettings,
  type AppSettings,
  type Task,
  type TaskDraft,
  type ThemeChoice,
} from './types';

type TaskContextValue = {
  ready: boolean;
  refreshing: boolean;
  storageError: string | null;
  tasks: Task[];
  settings: AppSettings;
  refresh: () => Promise<void>;
  clearError: () => void;
  addTask: (draft: TaskDraft) => void;
  updateTask: (id: string, draft: TaskDraft) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string, dateKey: string) => void;
  skipDay: (dateKey: string) => void;
  setTheme: (theme: ThemeChoice) => void;
  setReminder: (hour: number, minute: number) => Promise<string>;
  clearReminder: () => Promise<string>;
  clearData: () => void;
  exportData: () => string;
};

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [ready, setReady] = useState(false);
  const [canPersist, setCanPersist] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  const readStore = useCallback(async () => {
    const stored = await loadStore();
    setTasks(stored.tasks);
    setSettings(stored.settings);
  }, []);

  useEffect(() => {
    async function hydrate() {
      try {
        await readStore();
        setCanPersist(true);
      } catch {
        setStorageError('Could not load your tasks.');
      } finally {
        setReady(true);
      }
    }
    hydrate();
  }, [readStore]);

  useEffect(() => {
    if (!canPersist) {
      return;
    }
    saveTasks(tasks)
      .then(() => syncTaskNotifications(tasks))
      .catch(() => {
        setStorageError('Could not save your tasks.');
      });
  }, [tasks, canPersist]);

  useEffect(() => {
    if (!canPersist) {
      return;
    }
    saveSettings(settings).catch(() => {
      setStorageError('Could not save your settings.');
    });
  }, [settings, canPersist]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await readStore();
    } catch {
      setStorageError('Could not refresh your tasks.');
    } finally {
      setRefreshing(false);
    }
  }, [readStore]);

  const value = useMemo<TaskContextValue>(
    () => ({
      ready,
      refreshing,
      storageError,
      tasks,
      settings,
      refresh,
      clearError: () => setStorageError(null),
      addTask: (draft) => {
        const task: Task = {
          id: `${Date.now()}`,
          title: draft.title.trim(),
          notes: draft.notes?.trim() || undefined,
          scheduledDate: draft.scheduledDate,
          completedDates: [],
          repeat: draft.repeat,
          scheduledTime: draft.scheduledTime,
        };
        setTasks((current) => [task, ...current]);
      },
      updateTask: (id, draft) => {
        setTasks((current) =>
          current.map((task) =>
            task.id === id
              ? {
                  ...task,
                  title: draft.title.trim(),
                  notes: draft.notes?.trim() || undefined,
                  scheduledDate: draft.scheduledDate,
                  repeat: draft.repeat,
                  scheduledTime: draft.scheduledTime,
                }
              : task,
          ),
        );
      },
      deleteTask: (id) => {
        setTasks((current) => current.filter((task) => task.id !== id));
      },
      toggleComplete: (id, dateKey) => {
        setTasks((current) =>
          current.map((task) => {
            if (task.id !== id) {
              return task;
            }
            const completed = task.completedDates.includes(dateKey);
            return {
              ...task,
              completedDates: completed
                ? task.completedDates.filter((date) => date !== dateKey)
                : [...task.completedDates, dateKey],
            };
          }),
        );
      },
      skipDay: (dateKey) => {
        setSettings((current) =>
          current.skippedDays.includes(dateKey)
            ? current
            : { ...current, skippedDays: [...current.skippedDays, dateKey] },
        );
      },
      setTheme: (theme) => {
        setSettings((current) => ({ ...current, theme }));
      },
      setReminder: async (hour, minute) => {
        setSettings((current) => ({
          ...current,
          reminderEnabled: true,
          reminderHour: hour,
          reminderMinute: minute,
        }));
        return scheduleDailyReminder(hour, minute);
      },
      clearReminder: async () => {
        setSettings((current) => ({ ...current, reminderEnabled: false }));
        return cancelDailyReminder();
      },
      clearData: () => {
        setTasks([]);
        setSettings((current) => ({ ...current, skippedDays: [] }));
      },
      exportData: () =>
        JSON.stringify(
          {
            tasks,
            skippedDays: settings.skippedDays,
            reminder: settings.reminderEnabled
              ? {
                  hour: settings.reminderHour,
                  minute: settings.reminderMinute,
                }
              : null,
          },
          null,
          2,
        ),
    }),
    [ready, refreshing, storageError, tasks, settings, refresh],
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const value = useContext(TaskContext);
  if (!value) {
    throw new Error('useTasks must be used within TaskProvider');
  }
  return value;
}
