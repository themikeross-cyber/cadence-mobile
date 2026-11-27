import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmDialog } from '../../components/ConfirmDialog';
import { EmptyState } from '../../components/EmptyState';
import { TaskFormSheet } from '../../components/TaskFormSheet';
import {
  formatScheduledTime,
  formatShortDate,
  isCompleteOn,
  occursOn,
  repeatLabel,
  upcomingDates,
} from '../../data/dates';
import { useTasks } from '../../data/TaskProvider';
import type { TaskDraft } from '../../data/types';
import { hapticComplete, hapticDelete } from '../../haptics';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, space, type } from '../../theme/tokens';

export default function TaskDetailScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ id: string; date?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const dateParam = Array.isArray(params.date) ? params.date[0] : params.date;
  const { ready, tasks, toggleComplete, updateTask, deleteTask } = useTasks();
  const task = tasks.find((item) => item.id === id) ?? null;
  const dateKey =
    task && dateParam && occursOn(task, dateParam) ? dateParam : task?.scheduledDate;
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function saveEdit(draft: TaskDraft) {
    if (!task) {
      return;
    }
    updateTask(task.id, draft);
  }

  function confirmDelete() {
    if (!task) {
      return;
    }
    hapticDelete();
    deleteTask(task.id);
    setDeleteOpen(false);
    router.back();
  }

  const done = task && dateKey ? isCompleteOn(task, dateKey) : false;

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[styles.screen, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: task ? 'Task' : ready ? 'Not found' : 'Task',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      {!task && ready ? (
        <EmptyState
          title="Task not found"
          message="It may have been deleted on this device."
          actionLabel="Go back"
          onAction={() => router.back()}
        />
      ) : task && dateKey ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>{task.title}</Text>
          <Text style={[styles.body, { color: colors.muted }]}>
            {task.notes?.trim() ? task.notes : 'No notes yet'}
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}>
            <Row label="Time" value={formatScheduledTime(task.scheduledTime)} />
            <Row label="Repeat" value={repeatLabel(task.repeat, task.scheduledDate)} />
            <Row label="Status" value={done ? 'Completed' : 'Not completed'} />
          </View>
          <Text style={[styles.section, { color: colors.text }]}>Assigned days</Text>
          <Text style={[styles.body, { color: colors.muted }]}>
            {upcomingDates(task).map(formatShortDate).join('  ·  ')}
          </Text>
          <Pressable
            onPress={() => {
              if (!done) {
                hapticComplete();
              }
              toggleComplete(task.id, dateKey);
            }}
            style={[styles.primary, { backgroundColor: colors.accent }]}>
            <Text style={[styles.primaryLabel, { color: colors.onAccent }]}>
              {done ? 'Mark not complete' : 'Complete'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setEditing(true)}
            style={[styles.secondary, { borderColor: colors.border }]}>
            <Text style={[styles.secondaryLabel, { color: colors.text }]}>Edit</Text>
          </Pressable>
          <Pressable onPress={() => setDeleteOpen(true)} style={styles.delete}>
            <Text style={[styles.deleteLabel, { color: colors.danger }]}>Delete</Text>
          </Pressable>
        </ScrollView>
      ) : null}

      <ConfirmDialog
        visible={deleteOpen}
        title="Delete this task?"
        message={
          task?.repeat === 'none'
            ? 'This removes it from the selected day.'
            : 'This removes it from every day it repeats.'
        }
        confirmLabel="Delete"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />

      <TaskFormSheet
        visible={editing}
        dateKey={dateKey ?? task?.scheduledDate ?? ''}
        task={task}
        onClose={() => setEditing(false)}
        onSubmit={saveEdit}
      />
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: space.lg,
    gap: space.md,
  },
  title: {
    fontSize: type.title,
    fontWeight: '700',
  },
  body: {
    fontSize: type.body,
    lineHeight: 24,
  },
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: space.lg,
    gap: space.md,
  },
  row: {
    gap: space.xs,
  },
  rowLabel: {
    fontSize: type.caption,
  },
  rowValue: {
    fontSize: type.body,
  },
  section: {
    fontSize: type.body,
    fontWeight: '700',
    marginTop: space.sm,
  },
  primary: {
    borderRadius: radius.control,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: space.sm,
  },
  primaryLabel: {
    fontSize: type.body,
    fontWeight: '700',
  },
  secondary: {
    borderRadius: radius.control,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryLabel: {
    fontSize: type.body,
    fontWeight: '700',
  },
  delete: {
    alignItems: 'center',
    paddingVertical: space.md,
  },
  deleteLabel: {
    fontSize: type.body,
    fontWeight: '700',
  },
});
