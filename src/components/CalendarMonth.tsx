import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { monthCells, tasksOnDate, toDateKey } from '../data/dates';
import { dayState } from '../data/progress';
import type { Task } from '../data/types';
import { hapticSelect } from '../haptics';
import { useTheme } from '../theme/ThemeProvider';
import { space, type } from '../theme/tokens';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function CalendarMonth({
  month,
  tasks,
  skippedDays,
  selectedKey,
  onSelect,
  onShift,
}: {
  month: Date;
  tasks: Task[];
  skippedDays: string[];
  selectedKey: string;
  onSelect: (dateKey: string) => void;
  onShift: (amount: number) => void;
}) {
  const { colors } = useTheme();
  const today = toDateKey(new Date());
  const translateX = useSharedValue(0);
  const cells = monthCells(month.getFullYear(), month.getMonth());

  const shift = (amount: number) => {
    hapticSelect();
    onShift(amount);
  };

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-18, 18])
        .failOffsetY([-14, 14])
        .onUpdate((event) => {
          translateX.value = event.translationX;
        })
        .onEnd((event) => {
          if (event.translationX <= -48) {
            scheduleOnRN(shift, 1);
          } else if (event.translationX >= 48) {
            scheduleOnRN(shift, -1);
          }
          translateX.value = withTiming(0, { duration: 180 });
        }),
    [shift, translateX],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value * 0.12 }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={animatedStyle}>
        <View style={styles.weekdays}>
          {WEEKDAYS.map((label, index) => (
            <Text key={`${label}-${index}`} style={[styles.weekday, { color: colors.muted }]}>
              {label}
            </Text>
          ))}
        </View>
        <View style={styles.grid}>
          {cells.map((dateKey, index) => {
            if (!dateKey) {
              return <View key={`empty-${index}`} style={styles.cell} />;
            }
            const selected = dateKey === selectedKey;
            const isToday = dateKey === today;
            const state = dayState(tasks, skippedDays, dateKey, today);
            const count = tasksOnDate(tasks, dateKey).length;
            return (
              <Pressable
                key={dateKey}
                onPress={() => {
                  hapticSelect();
                  onSelect(dateKey);
                }}
                style={styles.cell}>
                <View
                  style={[
                    styles.day,
                    selected && { backgroundColor: colors.accent },
                    !selected && isToday && { borderColor: colors.accent, borderWidth: 1.5 },
                  ]}>
                  <Text
                    style={[
                      styles.dayText,
                      { color: selected ? colors.onAccent : colors.text },
                      isToday && !selected && { color: colors.accent },
                    ]}>
                    {Number(dateKey.slice(-2))}
                  </Text>
                </View>
                <View
                  style={[
                    styles.dot,
                    count > 0 && {
                      backgroundColor:
                        state === 'done' || state === 'skipped'
                          ? colors.accent
                          : colors.muted,
                    },
                  ]}
                />
              </Pressable>
            );
          })}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  weekdays: {
    flexDirection: 'row',
    marginBottom: space.sm,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: type.caption,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.285%',
    alignItems: 'center',
    paddingVertical: space.xs,
    minHeight: 48,
  },
  day: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: type.body,
    fontWeight: '600',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 2,
  },
});
