import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function TabLayout() {
  return (
    <View style={styles.screen}>
      <Text style={styles.header}>Cadence Mobile</Text>
      <View style={styles.tabs}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: '#FCBA28',
            tabBarInactiveTintColor: '#A8A8B3',
            headerStyle: { backgroundColor: '#121418' },
            headerTintColor: '#F5F5F5',
            headerShadowVisible: false,
            tabBarStyle: {
              backgroundColor: '#121418',
              borderTopColor: '#1C1F26',
            },
          }}>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Today',
              tabBarIcon: ({ color }) => (
                <Text style={[styles.icon, { color }]}>🎯</Text>
              ),
            }}
          />
          <Tabs.Screen
            name="history"
            options={{
              title: 'History',
              tabBarIcon: ({ color }) => (
                <Text style={[styles.icon, { color }]}>🕒</Text>
              ),
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
              tabBarIcon: ({ color }) => (
                <Text style={[styles.icon, { color }]}>⚙️</Text>
              ),
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#121418',
  },
  header: {
    color: '#F5F5F5',
    fontSize: 32,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  tabs: {
    flex: 1,
  },
  icon: {
    fontSize: 20,
  },
});
