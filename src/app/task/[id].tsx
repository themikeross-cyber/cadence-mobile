import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Task = {
  id: string;
  title: string;
  completedToday: boolean;
  notes?: string;
};

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = Array.isArray(id) ? id[0] : id;
  const [task, setTask] = useState<Task | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function loadTask() {
      const stored = await AsyncStorage.getItem('tasks');
      if (!stored) {
        setTask(null);
        setReady(true);
        return;
      }

      try {
        const tasks = JSON.parse(stored) as Task[];
        setTask(tasks.find((item) => item.id === taskId) ?? null);
      } catch {
        setTask(null);
      }
      setReady(true);
    }

    loadTask();
  }, [taskId]);

  const title = task?.title ?? (ready ? 'Not found' : 'Task');

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title,
          headerStyle: { backgroundColor: '#121418' },
          headerTintColor: '#F5F5F5',
          headerShadowVisible: false,
        }}
      />
      {task ? (
        <>
          <Text style={styles.heading}>{task.title}</Text>
          <Text style={styles.notes}>
            {task.notes?.trim() ? task.notes : 'No notes yet'}
          </Text>
          <Text style={styles.status}>
            {task.completedToday ? 'Completed today' : 'Not completed today'}
          </Text>
        </>
      ) : ready ? (
        <Text style={styles.heading}>Task not found</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#121418',
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  heading: {
    color: '#F5F5F5',
    fontSize: 32,
    fontWeight: '700',
  },
  notes: {
    color: '#F5F5F5',
    fontSize: 16,
    lineHeight: 24,
  },
  status: {
    color: '#A8A8B3',
    fontSize: 16,
  },
});
