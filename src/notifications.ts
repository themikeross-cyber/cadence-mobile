import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { dateAtTime, formatClock } from './data/dates';
import type { Task } from './data/types';

const DAILY_ID = 'cadence-daily-reminder';

export type NotificationAccess = {
  granted: boolean;
  canAskAgain: boolean;
  channelReady: boolean;
  message: string;
};

let accessRequest: Promise<NotificationAccess> | null = null;

async function askForNotificationAccess(): Promise<NotificationAccess> {
  if (Platform.OS === 'web') {
    return {
      granted: false,
      canAskAgain: false,
      channelReady: false,
      message: 'Reminders work on your phone.',
    };
  }

  let channelReady = false;
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Reminders',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
      channelReady = true;
    } catch (error) {
      console.log('Could not create the Android notification channel.', error);
    }
  }

  const current = await Notifications.getPermissionsAsync();
  const result =
    current.status === 'granted'
      ? current
      : await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
  const granted = result.granted || result.status === 'granted';

  if (!granted) {
    return {
      granted: false,
      canAskAgain: result.canAskAgain,
      channelReady,
      message: result.canAskAgain
        ? 'Tap here and allow notifications so reminders can reach your phone.'
        : 'Notifications are blocked for Expo Go. Enable them in your phone settings.',
    };
  }

  return {
    granted: true,
    canAskAgain: true,
    channelReady,
    message: '',
  };
}

export function ensureNotificationAccess() {
  if (!accessRequest) {
    accessRequest = askForNotificationAccess().catch((error) => {
      accessRequest = null;
      console.log('Could not ask for notification permission.', error);
      return {
        granted: false,
        canAskAgain: true,
        channelReady: false,
        message: 'Tap here to allow notifications.',
      };
    });
  }
  return accessRequest;
}

export function retryNotificationAccess() {
  accessRequest = null;
  return ensureNotificationAccess();
}

export async function scheduleDailyReminder(hour = 8, minute = 0) {
  if (Platform.OS === 'web') {
    return 'Reminders work on your phone.';
  }

  try {
    const access = await ensureNotificationAccess();
    if (!access.granted) {
      return access.message;
    }

    await Notifications.cancelScheduledNotificationAsync(DAILY_ID).catch(() => {});
    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_ID,
      content: {
        title: 'Cadence',
        body: 'Time to check your tasks.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        ...(access.channelReady ? { channelId: 'reminders' } : {}),
      },
    });

    return `Daily reminder set for ${formatClock(hour, minute)}.`;
  } catch (error) {
    console.log('Could not schedule the daily reminder.', error);
    return 'Could not schedule the reminder. Tap to allow notifications and try again.';
  }
}

export async function syncTaskNotifications(tasks: Task[]) {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    const access = await ensureNotificationAccess();
    if (!access.granted) {
      return;
    }

    const timed = tasks.filter((task) => task.scheduledTime);
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled
        .filter((item) => item.identifier.startsWith('task-'))
        .map((item) =>
          Notifications.cancelScheduledNotificationAsync(item.identifier).catch(() => {}),
        ),
    );

    for (const task of timed) {
      const time = task.scheduledTime;
      if (!time) {
        continue;
      }
      const [hour, minute] = time.split(':').map(Number);
      const content = {
        title: task.title,
        body: 'Time to check your tasks.',
      };
      const channel = access.channelReady ? { channelId: 'reminders' } : {};

      if (task.repeat === 'none') {
        if (task.completedDates.includes(task.scheduledDate)) {
          continue;
        }
        const when = dateAtTime(task.scheduledDate, time);
        if (when.getTime() <= Date.now()) {
          continue;
        }
        await Notifications.scheduleNotificationAsync({
          identifier: `task-${task.id}`,
          content,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: when,
            ...channel,
          },
        });
        continue;
      }

      if (task.repeat === 'daily') {
        await Notifications.scheduleNotificationAsync({
          identifier: `task-${task.id}`,
          content,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
            ...channel,
          },
        });
        continue;
      }

      for (const weekday of [2, 3, 4, 5, 6]) {
        await Notifications.scheduleNotificationAsync({
          identifier: `task-${task.id}-${weekday}`,
          content,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday,
            hour,
            minute,
            ...channel,
          },
        });
      }
    }
  } catch (error) {
    console.log('Could not schedule a task reminder.', error);
  }
}
