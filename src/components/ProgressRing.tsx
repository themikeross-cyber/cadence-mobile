import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../theme/ThemeProvider';
import { radius, space, type } from '../theme/tokens';

export function ProgressRing({
  complete,
  total,
}: {
  complete: number;
  total: number;
}) {
  const { colors } = useTheme();
  const progress = total === 0 ? 0 : complete / total;
  const value = useSharedValue(0);

  useEffect(() => {
    value.value = withTiming(progress, { duration: 420 });
  }, [progress, value]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.max(value.value, 0.04) * 100}%`,
    opacity: value.value === 0 ? 0 : 1,
  }));

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}>
      <View
        style={[
          styles.badge,
          { borderColor: progress === 0 ? colors.border : colors.accent },
        ]}>
        <Text style={[styles.percent, { color: colors.text }]}>
          {total === 0 ? '0' : Math.round(progress * 100)}
        </Text>
      </View>
      <View style={styles.copy}>
        <Text style={[styles.count, { color: colors.text }]}>
          {complete} of {total} complete
        </Text>
        <View style={[styles.track, { backgroundColor: colors.background }]}>
          <Animated.View
            style={[styles.fill, { backgroundColor: colors.accent }, fillStyle]}
          />
        </View>
        <Text style={[styles.caption, { color: colors.muted }]}>
          {total === 0
            ? 'Add a task to give today a shape.'
            : complete === total
              ? 'Today is finished.'
              : 'The rest can wait until you are ready.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: space.lg,
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percent: {
    fontSize: type.body,
    fontWeight: '700',
  },
  copy: {
    flex: 1,
    gap: space.sm,
  },
  count: {
    fontSize: type.title,
    fontWeight: '700',
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    borderRadius: 4,
  },
  caption: {
    fontSize: type.caption,
    lineHeight: 18,
  },
});
