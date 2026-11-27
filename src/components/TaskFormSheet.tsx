import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { formatClock, formatShortDate } from '../data/dates';
import type { RepeatRule, Task, TaskDraft } from '../data/types';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space, type } from '../theme/tokens';

const REPEATS: Array<{ value: RepeatRule; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays' },
];

export function TaskFormSheet({
  visible,
  dateKey,
  task,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  dateKey: string;
  task?: Task | null;
  onClose: () => void;
  onSubmit: (draft: TaskDraft) => void;
}) {
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [repeat, setRepeat] = useState<RepeatRule>('none');
  const [hasTime, setHasTime] = useState(false);
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const translateY = useSharedValue(480);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setTitle(task?.title ?? '');
    setNotes(task?.notes ?? '');
    setRepeat(task?.repeat ?? 'none');
    if (task?.scheduledTime) {
      const [savedHour, savedMinute] = task.scheduledTime.split(':').map(Number);
      setHasTime(true);
      setHour(savedHour);
      setMinute(savedMinute);
    } else {
      setHasTime(false);
      setHour(8);
      setMinute(0);
    }
    translateY.value = withTiming(0, { duration: 240 });
  }, [task, translateY, visible]);

  const close = () => {
    translateY.value = withTiming(480, { duration: 180 });
    onClose();
  };

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 120) {
        scheduleOnRN(close);
        return;
      }
      translateY.value = withTiming(0);
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  function submit() {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    onSubmit({
      title: trimmed,
      notes,
      scheduledDate: task?.scheduledDate ?? dateKey,
      repeat,
      scheduledTime: hasTime
        ? `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        : undefined,
    });
    close();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={close} />
        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              styles.sheet,
              sheetStyle,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}>
            <View style={[styles.handle, { backgroundColor: colors.muted }]} />
            <Text style={[styles.heading, { color: colors.text }]}>
              {task ? 'Edit task' : 'Add a task'}
            </Text>
            <Text style={[styles.date, { color: colors.muted }]}>
              {formatShortDate(task?.scheduledDate ?? dateKey)}
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Task title"
              placeholderTextColor={colors.muted}
              style={[
                styles.input,
                { color: colors.text, backgroundColor: colors.background, borderColor: colors.border },
              ]}
            />
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes"
              placeholderTextColor={colors.muted}
              multiline
              style={[
                styles.input,
                styles.notes,
                { color: colors.text, backgroundColor: colors.background, borderColor: colors.border },
              ]}
            />
            <View style={styles.repeatRow}>
              {REPEATS.map((option) => {
                const selected = repeat === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setRepeat(option.value)}
                    style={[
                      styles.segment,
                      {
                        backgroundColor: selected ? colors.accent : colors.background,
                        borderColor: colors.border,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.segmentLabel,
                        { color: selected ? colors.onAccent : colors.text },
                      ]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.timeRow}>
              <Pressable onPress={() => setHasTime((current) => !current)}>
                <Text style={[styles.timeToggle, { color: colors.accent }]}>
                  {hasTime ? 'Remove time' : 'Add a time'}
                </Text>
              </Pressable>
              {hasTime ? (
                <Text style={[styles.clock, { color: colors.text }]}>
                  {formatClock(hour, minute)}
                </Text>
              ) : null}
            </View>
            {hasTime ? (
              <View style={styles.steppers}>
                <Stepper
                  label="Hour"
                  onMinus={() => setHour((current) => (current + 23) % 24)}
                  onPlus={() => setHour((current) => (current + 1) % 24)}
                />
                <Stepper
                  label="Minute"
                  onMinus={() => setMinute((current) => (current + 55) % 60)}
                  onPlus={() => setMinute((current) => (current + 5) % 60)}
                />
              </View>
            ) : null}
            <Pressable
              disabled={title.trim() === ''}
              onPress={submit}
              style={({ pressed }) => [
                styles.save,
                {
                  backgroundColor: title.trim() === '' ? colors.border : colors.accent,
                  opacity: pressed ? 0.86 : 1,
                },
              ]}>
              <Text style={[styles.saveLabel, { color: colors.onAccent }]}>
                {task ? 'Save changes' : 'Add task'}
              </Text>
            </Pressable>
          </Animated.View>
        </GestureDetector>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Stepper({
  label,
  onMinus,
  onPlus,
}: {
  label: string;
  onMinus: () => void;
  onPlus: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.stepper}>
      <Text style={[styles.stepperLabel, { color: colors.muted }]}>{label}</Text>
      <View style={styles.stepperControls}>
        <Pressable
          onPress={onMinus}
          style={[styles.step, { backgroundColor: colors.background }]}>
          <Text style={[styles.stepLabel, { color: colors.text }]}>−</Text>
        </Pressable>
        <Pressable
          onPress={onPlus}
          style={[styles.step, { backgroundColor: colors.background }]}>
          <Text style={[styles.stepLabel, { color: colors.text }]}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.xxl,
    gap: space.md,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -6 },
    elevation: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    opacity: 0.5,
  },
  heading: {
    fontSize: type.title,
    fontWeight: '700',
  },
  date: {
    fontSize: type.caption,
    marginTop: -8,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.control,
    paddingHorizontal: space.lg,
    paddingVertical: 14,
    fontSize: type.body,
  },
  notes: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  repeatRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  segment: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.control,
    paddingVertical: space.md,
    alignItems: 'center',
  },
  segmentLabel: {
    fontSize: type.caption,
    fontWeight: '700',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeToggle: {
    fontSize: type.body,
    fontWeight: '600',
  },
  clock: {
    fontSize: type.body,
    fontWeight: '700',
  },
  steppers: {
    flexDirection: 'row',
    gap: space.md,
  },
  stepper: {
    flex: 1,
    gap: space.sm,
  },
  stepperLabel: {
    fontSize: type.caption,
  },
  stepperControls: {
    flexDirection: 'row',
    gap: space.sm,
  },
  step: {
    flex: 1,
    borderRadius: radius.control,
    alignItems: 'center',
    paddingVertical: space.sm,
  },
  stepLabel: {
    fontSize: type.title,
    fontWeight: '600',
  },
  save: {
    borderRadius: radius.control,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveLabel: {
    fontSize: type.body,
    fontWeight: '700',
  },
});
