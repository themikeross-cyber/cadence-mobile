import { router } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalendarMonth } from '../../components/CalendarMonth';
import { NotificationBanner } from '../../components/NotificationBanner';
import { EmptyState } from '../../components/EmptyState';
import { TaskFormSheet } from '../../components/TaskFormSheet';
import { TaskRow } from '../../components/TaskRow';
import {
  formatLongDate,
  formatMonth,
  shiftMonth,
  tasksOnDate,
  todayKey,
} from '../../data/dates';
import { useTasks } from '../../data/TaskProvider';
import type { TaskDraft } from '../../data/types';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, space, type } from '../../theme/tokens';

export default function CalendarScreen() {
  const { colors } = useTheme();
  const {
    tasks,
    settings,
    refreshing,
    refresh,
    addTask,
    toggleComplete,
    storageError,
    clearError,
  } = useTasks();
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [selectedKey, setSelectedKey] = useState(todayKey);
  const [sheetOpen, setSheetOpen] = useState(false);
  const dayTasks = tasksOnDate(tasks, selectedKey);

  function openTask(id: string, dateKey: string) {
    router.push({ pathname: '/task/[id]', params: { id, date: dateKey } });
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
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={[styles.brand, { color: colors.muted }]}>Cadence</Text>
                <Text style={[styles.title, { color: colors.text }]}>{formatMonth(month)}</Text>
              </View>
              <View style={styles.arrows}>
                <Pressable
                  onPress={() => setMonth((current) => shiftMonth(current, -1))}
                  style={[styles.arrow, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.arrowLabel, { color: colors.text }]}>‹</Text>
                </Pressable>
                <Pressable
                  onPress={() => setMonth((current) => shiftMonth(current, 1))}
                  style={[styles.arrow, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.arrowLabel, { color: colors.text }]}>›</Text>
                </Pressable>
              </View>
            </View>
            <Text style={[styles.reloadHint, { color: colors.muted }]}>
              Swipe down to reload.
            </Text>

            {storageError ? (
              <Pressable
                onPress={clearError}
                style={[styles.error, { backgroundColor: colors.danger }]}>
                <Text style={styles.errorText}>{storageError}</Text>
              </Pressable>
            ) : null}

            <NotificationBanner />

            <CalendarMonth
              month={month}
              tasks={tasks}
              skippedDays={settings.skippedDays}
              selectedKey={selectedKey}
              onSelect={setSelectedKey}
              onShift={(amount) => setMonth((current) => shiftMonth(current, amount))}
            />

            <View style={styles.dayHeader}>
              <View style={styles.dayCopy}>
                <Text style={[styles.dayTitle, { color: colors.text }]}>
                  {formatLongDate(selectedKey)}
                </Text>
                <Text style={[styles.dayMeta, { color: colors.muted }]}>
                  {dayTasks.length === 0
                    ? 'No tasks yet'
                    : `${dayTasks.length} scheduled`}
                </Text>
              </View>
              <Pressable
                onPress={() => setSheetOpen(true)}
                style={[styles.add, { backgroundColor: colors.accent }]}>
                <Text style={[styles.addLabel, { color: colors.onAccent }]}>Add</Text>
              </Pressable>
            </View>
          </View>
        }
        contentContainerStyle={[
          styles.list,
          dayTasks.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={
          <EmptyState
            title="This day is open"
            message="Add one task. Cadence will keep it on this date."
            actionLabel="Add a task"
            onAction={() => setSheetOpen(true)}
          />
        }
        renderItem={({ item }) => (
          <TaskRow
            task={item}
            dateKey={selectedKey}
            onToggle={toggleComplete}
            onOpen={openTask}
          />
        )}
      />

      <TaskFormSheet
        visible={sheetOpen}
        dateKey={selectedKey}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: space.sm,
    marginBottom: space.lg,
  },
  brand: {
    fontSize: type.caption,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  reloadHint: {
    fontSize: type.caption,
    marginTop: -space.sm,
    marginBottom: space.md,
  },
  title: {
    fontSize: type.title,
    fontWeight: '700',
  },
  arrows: {
    flexDirection: 'row',
    gap: space.sm,
  },
  arrow: {
    width: 36,
    height: 36,
    borderRadius: radius.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowLabel: {
    fontSize: 22,
    lineHeight: 24,
  },
  error: {
    borderRadius: radius.control,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    marginBottom: space.md,
  },
  errorText: {
    color: '#1C1A1B',
    fontSize: type.caption,
    textAlign: 'center',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.lg,
    marginBottom: space.md,
    gap: space.md,
  },
  dayCopy: {
    flex: 1,
    gap: space.xs,
  },
  dayTitle: {
    fontSize: type.body,
    fontWeight: '700',
  },
  dayMeta: {
    fontSize: type.caption,
  },
  add: {
    borderRadius: radius.control,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
  },
  addLabel: {
    fontSize: type.body,
    fontWeight: '700',
  },
  list: {
    gap: space.md,
    paddingBottom: space.xxl,
  },
  emptyList: {
    flexGrow: 1,
  },
});
