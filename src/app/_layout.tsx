import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export async function scheduleDailyReminder(): Promise<string> {
  if (Platform.OS === 'web') {
    return 'Reminders work on your phone.';
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      body: 'Time to check your tasks.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 8,
      minute: 0,
    },
  });

  return 'Daily reminder set for 8:00 AM.';
}

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'web') {
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
        if (result.granted) {
          console.log('Notification permissions granted.');
          const message = await scheduleDailyReminder();
          console.log(message);
        } else {
          console.log('Notification permissions denied.');
        }
      } catch (error) {
        console.log('Could not request notification permissions.', error);
      }
    }

    requestNotificationPermissions();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
