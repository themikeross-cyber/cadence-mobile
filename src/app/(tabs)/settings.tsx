import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatClock } from '../../data/dates';
import { useTasks } from '../../data/TaskProvider';
import type { ThemeChoice } from '../../data/types';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, space, type } from '../../theme/tokens';

const THEMES: Array<{ value: ThemeChoice; label: string }> = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
];

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { settings, setTheme, setReminder, clearReminder, exportData, clearData } = useTasks();
  const [hour, setHour] = useState(settings.reminderHour);
  const [minute, setMinute] = useState(settings.reminderMinute);

  useEffect(() => {
    setHour(settings.reminderHour);
    setMinute(settings.reminderMinute);
  }, [settings.reminderHour, settings.reminderMinute]);
  const [message, setMessage] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exported, setExported] = useState('');

  async function saveReminder() {
    try {
      const result = await setReminder(hour, minute);
      setMessage(result);
    } catch (error) {
      console.log('Could not schedule the reminder.', error);
      setMessage('Could not schedule the reminder. Allow notifications for Expo Go and try again.');
    }
  }

  async function removeReminder() {
    try {
      const result = await clearReminder();
      setMessage(result);
    } catch (error) {
      console.log('Could not remove the reminder.', error);
      setMessage('Could not remove the reminder. Try again.');
    }
  }

  function confirmClear() {
    Alert.alert(
      'Clear tasks?',
      'This removes every task and skipped day on this device. Your theme and reminder stay.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearData },
      ],
    );
  }

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.brand, { color: colors.muted }]}>Settings</Text>
        <Text style={[styles.title, { color: colors.text }]}>Cadence</Text>
        <Text style={[styles.privacy, { color: colors.muted }]}>
          On this device only. No account.
        </Text>

        <Text style={[styles.section, { color: colors.text }]}>Theme</Text>
        <View style={styles.segments}>
          {THEMES.map((option) => {
            const selected = settings.theme === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setTheme(option.value)}
                style={[
                  styles.segment,
                  {
                    backgroundColor: selected ? colors.accent : colors.surface,
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

        <Text style={[styles.section, { color: colors.text }]}>Reminder</Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}>
          <Text style={[styles.clock, { color: colors.text }]}>
            {formatClock(hour, minute)}
          </Text>
          <View style={styles.steppers}>
            <TimeStep
              label="Hour"
              onMinus={() => setHour((current) => (current + 23) % 24)}
              onPlus={() => setHour((current) => (current + 1) % 24)}
            />
            <TimeStep
              label="Minute"
              onMinus={() => setMinute((current) => (current + 55) % 60)}
              onPlus={() => setMinute((current) => (current + 5) % 60)}
            />
          </View>
          <Pressable
            onPress={saveReminder}
            style={[styles.save, { backgroundColor: colors.accent }]}>
            <Text style={[styles.saveLabel, { color: colors.onAccent }]}>
              Save reminder
            </Text>
          </Pressable>
          {settings.reminderEnabled ? (
            <Pressable onPress={removeReminder} style={styles.remove}>
              <Text style={[styles.removeLabel, { color: colors.danger }]}>
                Remove reminder
              </Text>
            </Pressable>
          ) : (
            <Text style={[styles.message, { color: colors.muted }]}>No daily reminder.</Text>
          )}
          {message ? (
            <Text style={[styles.message, { color: colors.muted }]}>{message}</Text>
          ) : null}
        </View>

        <Text style={[styles.section, { color: colors.text }]}>Your data</Text>
        <Pressable
          onPress={() => {
            setExported(exportData());
            setExportOpen(true);
          }}
          style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.rowLabel, { color: colors.text }]}>Export</Text>
        </Pressable>
        <Pressable
          onPress={confirmClear}
          style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.rowLabel, { color: colors.danger }]}>Clear tasks</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={exportOpen} transparent animationType="fade">
        <View style={[styles.exportBackdrop, { backgroundColor: colors.overlay }]}>
          <View
            style={[
              styles.exportCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}>
            <Text style={[styles.section, { color: colors.text }]}>Export</Text>
            <TextInput
              value={exported}
              editable={false}
              multiline
              style={[
                styles.exportInput,
                { color: colors.text, backgroundColor: colors.background, borderColor: colors.border },
              ]}
            />
            <Pressable onPress={() => setExportOpen(false)}>
              <Text style={[styles.saveLabel, { color: colors.accent }]}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function TimeStep({
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
    <View style={styles.step}>
      <Text style={[styles.stepLabel, { color: colors.muted }]}>{label}</Text>
      <View style={styles.stepControls}>
        <Pressable
          onPress={onMinus}
          style={[styles.stepButton, { backgroundColor: colors.background }]}>
          <Text style={[styles.stepButtonLabel, { color: colors.text }]}>−</Text>
        </Pressable>
        <Pressable
          onPress={onPlus}
          style={[styles.stepButton, { backgroundColor: colors.background }]}>
          <Text style={[styles.stepButtonLabel, { color: colors.text }]}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl,
    gap: space.md,
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
  },
  privacy: {
    fontSize: type.body,
    lineHeight: 24,
    marginBottom: space.sm,
  },
  section: {
    fontSize: type.body,
    fontWeight: '700',
    marginTop: space.sm,
  },
  segments: {
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
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: space.lg,
    gap: space.md,
  },
  clock: {
    fontSize: type.title,
    fontWeight: '700',
  },
  steppers: {
    flexDirection: 'row',
    gap: space.md,
  },
  step: {
    flex: 1,
    gap: space.sm,
  },
  stepLabel: {
    fontSize: type.caption,
  },
  stepControls: {
    flexDirection: 'row',
    gap: space.sm,
  },
  stepButton: {
    flex: 1,
    borderRadius: radius.control,
    alignItems: 'center',
    paddingVertical: space.sm,
  },
  stepButtonLabel: {
    fontSize: type.title,
  },
  save: {
    borderRadius: radius.control,
    paddingVertical: 14,
    alignItems: 'center',
  },
  remove: {
    alignItems: 'center',
    paddingVertical: space.xs,
  },
  removeLabel: {
    fontSize: type.body,
    fontWeight: '700',
  },
  saveLabel: {
    fontSize: type.body,
    fontWeight: '700',
  },
  message: {
    fontSize: type.caption,
    textAlign: 'center',
  },
  row: {
    borderRadius: radius.card,
    borderWidth: 1,
    paddingVertical: space.lg,
    paddingHorizontal: space.lg,
  },
  rowLabel: {
    fontSize: type.body,
    fontWeight: '600',
  },
  exportBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: space.lg,
  },
  exportCard: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: space.lg,
    gap: space.md,
  },
  exportInput: {
    minHeight: 180,
    borderWidth: 1,
    borderRadius: radius.control,
    padding: space.md,
    fontSize: type.caption,
    textAlignVertical: 'top',
  },
});
