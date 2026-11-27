import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '../../components/EmptyState';
import { ProgressRing } from '../../components/ProgressRing';
import { TaskFormSheet } from '../../components/TaskFormSheet';
import { TaskRow } from '../../components/TaskRow';
import { isCompleteOn, tasksOnDate, todayKey } from '../../data/dates';
import { useTasks } from '../../data/TaskProvider';
import type { TaskDraft } from '../../data/types';
import { hapticSelect } from '../../haptics';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, space, type } from '../../theme/tokens';

export default function TodayScreen() {
  const { colors } = useTheme();
  const {
    tasks,
    settings,
    refreshing,
    refresh,
    addTask,
    toggleComplete,
    skipDay,
  } = useTasks();
  const dateKey = todayKey();
  const dayTasks = tasksOnDate(tasks, dateKey);
  const complete = dayTasks.filter((task) => isCompleteOn(task, dateKey)).length;
  const skipped = settings.skippedDays.includes(dateKey);
  const [sheetOpen, setSheetOpen] = useState(false);

  function openTask(id: string, selectedDate: string) {
    router.push({ pathname: '/task/[id]', params: { id, date: selectedDate } });
  }

  function saveTask(draft: TaskDraft) {
    addTask(draft);
  }

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlatList
        data={dayTasks}
        keyExtractor={(task) => task.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
            progressBackgroundColor={colors.surface}
          />
        }
        contentContainerStyle={[
          styles.list,
          dayTasks.length === 0 && styles.emptyList,
        ]}
        ListHeaderComponent={
          <View>
            <Text style={[styles.brand, { color: colors.muted }]}>Today</Text>
            <Text style={[styles.title, { color: colors.text }]}>What matters now</Text>
            <Text style={[styles.reloadHint, { color: colors.muted }]}>
              Swipe down to reload.
            </Text>
            <View style={styles.progress}>
              <ProgressRing complete={complete} total={dayTasks.length} />
            </View>
            {skipped ? (
              <Text style={[styles.note, { color: colors.muted }]}>
                Today is skipped. Your streak stays intact.
              </Text>
            ) : dayTasks.length > 0 && complete < dayTasks.length ? (
              <Pressable
                onPress={() => {
                  hapticSelect();
                  skipDay(dateKey);
                }}
                style={styles.skip}>
                <Text style={[styles.skipLabel, { color: colors.accent }]}>Skip today</Text>
              </Pressable>
            ) : null}
            {dayTasks.length > 0 ? (
              <Text style={[styles.hint, { color: colors.muted }]}>
                Swipe a task right to complete it.
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="Nothing scheduled"
            message="Add a task for today, then let the reminder bring you back."
            actionLabel="Add a task"
            onAction={() => setSheetOpen(true)}
          />
        }
        renderItem={({ item }) => (
          <TaskRow
            task={item}
            dateKey={dateKey}
            onToggle={toggleComplete}
            onOpen={openTask}
          />
        )}
      />

      {dayTasks.length > 0 ? (
        <Pressable
          onPress={() => setSheetOpen(true)}
          style={[styles.quickAdd, { backgroundColor: colors.accent }]}>
          <Text style={[styles.quickAddLabel, { color: colors.onAccent }]}>Add a task</Text>
        </Pressable>
      ) : null}

      <TaskFormSheet
        visible={sheetOpen}
        dateKey={dateKey}
        onClose={() => setSheetOpen(false)}
        onSubmit={saveTask}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: space.lg,
  },
  brand: {
    fontSize: type.caption,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: space.sm,
  },
  title: {
    fontSize: type.title,
    fontWeight: '700',
    marginBottom: space.xs,
  },
  reloadHint: {
    fontSize: type.caption,
    marginBottom: space.lg,
  },
  progress: {
    marginBottom: space.md,
  },
  note: {
    fontSize: type.caption,
    marginBottom: space.md,
  },
  skip: {
    alignSelf: 'flex-start',
    marginBottom: space.md,
  },
  skipLabel: {
    fontSize: type.body,
    fontWeight: '600',
  },
  hint: {
    fontSize: type.caption,
    marginBottom: space.md,
  },
  list: {
    gap: space.md,
    paddingBottom: space.xxl,
  },
  emptyList: {
    flexGrow: 1,
  },
  quickAdd: {
    borderRadius: radius.control,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: space.lg,
  },
  quickAddLabel: {
    fontSize: type.body,
    fontWeight: '700',
  },
});
