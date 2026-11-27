import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { formatClock } from './data/dates';

export async function scheduleDailyReminder(hour = 8, minute = 0) {
  if (Platform.OS === 'web') {
    return 'Reminders work on your phone.';
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      body: 'Time to check your tasks.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      ...(Platform.OS === 'android' ? { channelId: 'reminders' } : {}),
    },
  });

  return `Daily reminder set for ${formatClock(hour, minute)}.`;
}
