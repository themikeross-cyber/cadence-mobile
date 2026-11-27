import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { monthCells, parseDateKey, todayKey } from '../../data/dates';
import { completionRate, currentStreak, dayState, lastSevenDays } from '../../data/progress';
import { useTasks } from '../../data/TaskProvider';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, space, type } from '../../theme/tokens';

export default function StatsScreen() {
  const { colors } = useTheme();
  const { tasks, settings } = useTasks();
  const streak = currentStreak(tasks, settings.skippedDays);
  const days = lastSevenDays();
  const dayLetters = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const today = todayKey();
  const now = new Date();
  const cells = monthCells(now.getFullYear(), now.getMonth());

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.screen, { backgroundColor: colors.background }]}>
      <Text style={[styles.brand, { color: colors.muted }]}>Stats</Text>
      <Text style={[styles.title, { color: colors.text }]}>Progress</Text>

      <View
        style={[
          styles.streakCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}>
        <Text style={[styles.streakCount, { color: colors.accent }]}>{streak.count}</Text>
        <Text style={[styles.streakLabel, { color: colors.text }]}>
          day streak
        </Text>
        <Text style={[styles.caption, { color: colors.muted }]}>
          {streak.freezeAvailable
            ? 'One missed day can be forgiven if the next day is finished.'
            : 'The freeze was used. Finish the next day to keep going.'}
        </Text>
      </View>

      <Text style={[styles.section, { color: colors.text }]}>Last 7 days</Text>
      <View style={styles.bars}>
        {days.map((dateKey) => {
          const rate = completionRate(tasks, dateKey);
          return (
            <View key={dateKey} style={styles.barCol}>
              <View style={[styles.barTrack, { backgroundColor: colors.surface }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      backgroundColor: colors.accent,
                      height: `${Math.max(rate * 100, rate > 0 ? 8 : 0)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, { color: colors.muted }]}>
                {dayLetters[parseDateKey(dateKey).getDay()]}
              </Text>
            </View>
          );
        })}
      </View>

      <Text style={[styles.section, { color: colors.text }]}>This month</Text>
      <View
        style={[
          styles.heatCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}>
        <View style={styles.heatGrid}>
          {cells.map((dateKey, index) => {
            if (!dateKey) {
              return <View key={`pad-${index}`} style={styles.heatCell} />;
            }
            const state = dayState(tasks, settings.skippedDays, dateKey, today);
            const rate = completionRate(tasks, dateKey);
            const backgroundColor =
              state === 'done'
                ? colors.accent
                : state === 'skipped'
                  ? 'transparent'
                  : rate > 0
                    ? 'rgba(252, 186, 40, 0.45)'
                    : colors.background;
            return (
              <View key={dateKey} style={styles.heatCell}>
                <View
                  style={[
                    styles.heatDot,
                    {
                      backgroundColor,
                      borderColor: state === 'skipped' ? colors.accent : 'transparent',
                      borderWidth: state === 'skipped' ? 1 : 0,
                    },
                  ]}
                />
              </View>
            );
          })}
        </View>
      </View>
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
    marginBottom: space.lg,
  },
  streakCard: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: space.xl,
    gap: space.xs,
    marginBottom: space.xl,
  },
  streakCount: {
    fontSize: 56,
    fontWeight: '700',
    lineHeight: 60,
  },
  streakLabel: {
    fontSize: type.body,
    fontWeight: '700',
  },
  caption: {
    fontSize: type.caption,
    lineHeight: 18,
    marginTop: space.sm,
  },
  section: {
    fontSize: type.body,
    fontWeight: '700',
    marginBottom: space.md,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.sm,
    height: 140,
    marginBottom: space.xl,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: space.sm,
    height: '100%',
  },
  barTrack: {
    flex: 1,
    width: '100%',
    borderRadius: radius.control,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: radius.control,
  },
  barLabel: {
    fontSize: type.caption,
  },
  heatCard: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: space.md,
  },
  heatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  heatCell: {
    width: '14.285%',
    alignItems: 'center',
    paddingVertical: space.xs,
  },
  heatDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
