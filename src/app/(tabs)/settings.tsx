import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SETTINGS = ['Theme', 'Daily reminder', 'About'];

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.list}>
        {SETTINGS.map((label) => (
          <View key={label} style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#121418',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  title: {
    color: '#F5F5F5',
    fontSize: 40,
    fontWeight: '700',
    marginBottom: 28,
  },
  list: {
    gap: 12,
  },
  row: {
    backgroundColor: '#1C1F26',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLabel: {
    color: '#F5F5F5',
    fontSize: 16,
  },
});
