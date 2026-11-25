import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HISTORY = [
  { id: '1', title: 'Review VPN config', completions: 5 },
  { id: '2', title: 'Update SharePoint permissions', completions: 2 },
  { id: '3', title: 'Check Defender alerts', completions: 8 },
];

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>History</Text>
      <View style={styles.list}>
        {HISTORY.map((item) => (
          <View key={item.id} style={styles.row}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text style={styles.count}>{item.completions}</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1F26',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  taskTitle: {
    flex: 1,
    color: '#F5F5F5',
    fontSize: 16,
  },
  count: {
    color: '#FCBA28',
    fontSize: 16,
    fontWeight: '700',
  },
});
