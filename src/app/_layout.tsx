import { useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { TaskProvider, useTasks } from '../data/TaskProvider';
import { scheduleDailyReminder } from '../notifications';
import { ThemeProvider, useTheme } from '../theme/ThemeProvider';

function NotificationBootstrap() {
  const { ready, settings } = useTasks();

  useEffect(() => {
    if (!ready || Platform.OS === 'web') {
      return;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    async function requestNotificationPermissions() {
      try {
        const result = await Notifications.requestPermissionsAsync();
        console.log(result);
        if (result.granted && settings.reminderEnabled) {
          console.log('Notification permissions granted.');
          const message = await scheduleDailyReminder(
            settings.reminderHour,
            settings.reminderMinute,
          );
          console.log(message);
        } else {
          console.log('Notification permissions denied.');
        }
      } catch (error) {
        console.log('Could not request notification permissions.', error);
      }
    }

    requestNotificationPermissions();
    // Schedule once after stored settings load. Later edits reschedule from Settings.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return null;
}

function RootChrome() {
  const { settings } = useTasks();

  return (
    <ThemeProvider choice={settings.theme}>
      <ThemedStack />
    </ThemeProvider>
  );
}

function ThemedStack() {
  const { colors, scheme } = useTheme();

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <NotificationBootstrap />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <TaskProvider>
          <RootChrome />
        </TaskProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
