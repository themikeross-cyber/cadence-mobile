import { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { formatScheduledTime, isCompleteOn } from '../data/dates';
import type { Task } from '../data/types';
import { hapticComplete } from '../haptics';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space, type } from '../theme/tokens';

const SWIPE_THRESHOLD = 96;

export function TaskRow({
  task,
  dateKey,
  onToggle,
  onOpen,
}: {
  task: Task;
  dateKey: string;
  onToggle: (id: string, dateKey: string) => void;
  onOpen: (id: string, dateKey: string) => void;
}) {
  const { colors } = useTheme();
  const done = isCompleteOn(task, dateKey);
  const translateX = useSharedValue(0);
  const checkScale = useSharedValue(done ? 1 : 0.82);

  useEffect(() => {
    checkScale.value = withTiming(done ? 1 : 0.82, { duration: 180 });
  }, [checkScale, done]);

  const complete = () => {
    if (!done) {
      hapticComplete();
    }
    onToggle(task.id, dateKey);
  };

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX(16)
        .failOffsetY([-16, 16])
        .onUpdate((event) => {
          translateX.value = Math.max(0, event.translationX);
        })
        .onEnd((event) => {
          if (event.translationX > SWIPE_THRESHOLD && !done) {
            scheduleOnRN(complete);
          }
          translateX.value = withTiming(0);
        }),
    [complete, translateX],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View entering={FadeInDown.duration(220)}>
        <Animated.View style={animatedStyle}>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}>
          <Pressable
            onPress={() => complete()}
            style={styles.checkHit}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: done }}>
            <Animated.View
              style={[
                styles.check,
                checkStyle,
                {
                  borderColor: done ? colors.accent : colors.muted,
                  backgroundColor: done ? colors.accent : 'transparent',
                },
              ]}>
              {done ? <View style={styles.tick} /> : null}
            </Animated.View>
          </Pressable>
          <Pressable onPress={() => onOpen(task.id, dateKey)} style={styles.body}>
            <Text
              style={[
                styles.title,
                { color: done ? colors.muted : colors.text },
                done && styles.doneTitle,
              ]}>
              {task.title}
            </Text>
            <Text style={[styles.meta, { color: colors.muted }]}>
              {formatScheduledTime(task.scheduledTime)}
              {task.repeat !== 'none'
                ? ` · ${task.repeat === 'daily' ? 'Daily' : 'Weekdays'}`
                : ''}
            </Text>
          </Pressable>
        </View>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 64,
    borderRadius: radius.card,
    borderWidth: 1,
    paddingVertical: space.md,
    paddingRight: space.lg,
    paddingLeft: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  checkHit: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: {
    width: 8,
    height: 5,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#1C1A1B',
    transform: [{ rotate: '-45deg' }, { translateY: -1 }],
  },
  body: {
    flex: 1,
    gap: space.xs,
  },
  title: {
    fontSize: type.body,
    fontWeight: '600',
  },
  doneTitle: {
    textDecorationLine: 'line-through',
  },
  meta: {
    fontSize: type.caption,
  },
});
