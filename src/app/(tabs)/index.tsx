import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

type Task = {
  id: string;
  title: string;
  completedToday: boolean;
};

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Review VPN config', completedToday: false },
  { id: '2', title: 'Update SharePoint permissions', completedToday: false },
  { id: '3', title: 'Check Defender alerts', completedToday: false },
];

const SWIPE_THRESHOLD = 120;

function TaskCard({
  task,
  onToggle,
}: {
  task: Task;
  onToggle: (id: string) => void;
}) {
  const translateX = useSharedValue(0);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX(15)
        .failOffsetY([-15, 15])
        .onUpdate((event) => {
          translateX.value = Math.max(0, event.translationX);
        })
        .onEnd((event) => {
          if (event.translationX > SWIPE_THRESHOLD) {
            scheduleOnRN(onToggle, task.id);
          }
          translateX.value = withTiming(0);
        }),
    [onToggle, task.id, translateX],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          styles.card,
          task.completedToday && styles.cardDone,
          animatedStyle,
        ]}>
        <Link href={`/task/${task.id}`} asChild>
          <Pressable style={styles.cardBody}>
            <Text
              style={[
                styles.cardTitle,
                task.completedToday && styles.cardTitleDone,
              ]}>
              {task.title}
            </Text>
          </Pressable>
        </Link>
        <Pressable onPress={() => onToggle(task.id)} style={styles.doneButton}>
          <Text style={styles.doneLabel}>Done</Text>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

export default function TodayScreen() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [newTask, setNewTask] = useState('');
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTasks() {
      try {
        const stored = await AsyncStorage.getItem('tasks');
        if (stored) {
          setTasks(JSON.parse(stored));
        }
      } catch {
        setStorageError('Could not load your tasks.');
      }
    }

    loadTasks();
  }, []);

  useEffect(() => {
    async function saveTasks() {
      try {
        await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      } catch {
        setStorageError('Could not save your tasks.');
      }
    }

    saveTasks();
  }, [tasks]);

  function addTask() {
    const title = newTask.trim();
    if (title.length === 0) {
      return;
    }

    setTasks((current) => [
      ...current,
      { id: Date.now().toString(), title, completedToday: false },
    ]);
    setNewTask('');
  }

  function toggleCompleted(id: string) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? { ...task, completedToday: !task.completedToday }
          : task,
      ),
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}>
      <View style={styles.screen}>
        {storageError ? (
          <Pressable
            onPress={() => setStorageError(null)}
            style={styles.errorBanner}>
            <Text style={styles.errorText}>{storageError}</Text>
          </Pressable>
        ) : null}
        <View style={styles.composer}>
          <TextInput
            value={newTask}
            onChangeText={setNewTask}
            placeholder="New task"
            placeholderTextColor="#A8A8B3"
            style={styles.input}
          />
          <Pressable
            disabled={newTask.trim() === ''}
            onPress={addTask}
            style={[
              styles.addButton,
              newTask.trim() === '' && styles.addButtonDisabled,
            ]}>
            <Text style={styles.addLabel}>Add</Text>
          </Pressable>
        </View>

        <FlatList
          data={tasks}
          keyExtractor={(task) => task.id}
          contentContainerStyle={[
            styles.list,
            tasks.length === 0 && styles.emptyList,
          ]}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No tasks yet. Add one above to get started.
            </Text>
          }
          renderItem={({ item }) => (
            <TaskCard task={item} onToggle={toggleCompleted} />
          )}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#121418',
  },
  errorBanner: {
    backgroundColor: '#FF6B6B',
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  errorText: {
    color: '#1A1406',
    fontSize: 14,
    textAlign: 'center',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#1C1F26',
    color: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#FCBA28',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  addButtonDisabled: {
    backgroundColor: '#3A3F4B',
  },
  addLabel: {
    color: '#1A1406',
    fontSize: 16,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyText: {
    color: '#A8A8B3',
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1F26',
    borderRadius: 12,
    minHeight: 44,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  cardBody: {
    flex: 1,
  },
  cardDone: {
    backgroundColor: '#1B7A45',
  },
  cardTitle: {
    flex: 1,
    color: '#F5F5F5',
    fontSize: 16,
  },
  cardTitleDone: {
    flex: 1,
    color: '#6E6E78',
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  doneButton: {
    backgroundColor: '#FCBA28',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  doneLabel: {
    color: '#1A1406',
    fontSize: 14,
    fontWeight: '700',
  },
});
