import { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text } from 'react-native';

import { useTasks } from '../data/TaskProvider';
import {
  ensureNotificationAccess,
  retryNotificationAccess,
  scheduleDailyReminder,
  syncTaskNotifications,
} from '../notifications';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space, type } from '../theme/tokens';

export function NotificationBanner() {
  const { colors } = useTheme();
  const { ready, settings, tasks } = useTasks();
  const [message, setMessage] = useState<string | null>(null);
  const [canAskAgain, setCanAskAgain] = useState(true);

  useEffect(() => {
    if (!ready || Platform.OS === 'web') {
      return;
    }

    let active = true;
    const schedule = settings.reminderEnabled
      ? scheduleDailyReminder(settings.reminderHour, settings.reminderMinute)
      : Promise.resolve('');
    schedule.then(
      async (result) => {
        if (!active) {
          return;
        }
        const access = await ensureNotificationAccess();
        setCanAskAgain(access.canAskAgain);
        if (access.granted) {
          await syncTaskNotifications(tasks);
        }
        setMessage(result || null);
      },
    );

    return () => {
      active = false;
    };
    // Ask once after saved settings load. Saving a new time goes through Settings.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  async function press() {
    if (!canAskAgain) {
      await Linking.openSettings();
      return;
    }
    const access = await retryNotificationAccess();
    if (!access.granted) {
      setCanAskAgain(access.canAskAgain);
      setMessage(access.message);
      return;
    }
    const result = settings.reminderEnabled
      ? await scheduleDailyReminder(settings.reminderHour, settings.reminderMinute)
      : '';
    await syncTaskNotifications(tasks);
    setMessage(result.startsWith('Daily reminder set') ? null : result);
  }

  if (!message) {
    return null;
  }

  return (
    <Pressable
      onPress={press}
      style={[styles.banner, { backgroundColor: colors.surface, borderColor: colors.accent }]}>
      <Text style={[styles.text, { color: colors.text }]}>{message}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1,
    borderRadius: radius.control,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    marginBottom: space.md,
  },
  text: {
    fontSize: type.caption,
    lineHeight: 18,
  },
});
