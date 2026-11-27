import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radius, space, type } from '../theme/tokens';

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.muted }]}>{message}</Text>
      <Pressable
        onPress={onAction}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.accent, opacity: pressed ? 0.86 : 1 },
        ]}>
        <Text style={[styles.buttonLabel, { color: colors.onAccent }]}>
          {actionLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
    paddingVertical: space.xxl,
    gap: space.sm,
  },
  title: {
    fontSize: type.title,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: type.body,
    lineHeight: 24,
    textAlign: 'center',
  },
  button: {
    marginTop: space.sm,
    borderRadius: radius.control,
    paddingVertical: 14,
    paddingHorizontal: space.xl,
  },
  buttonLabel: {
    fontSize: type.body,
    fontWeight: '700',
  },
});
