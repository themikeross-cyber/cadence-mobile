import { type ColorValue, StyleSheet, View } from 'react-native';

type IconProps = { color: ColorValue };

export function CalendarIcon({ color }: IconProps) {
  return (
    <View style={styles.frame}>
      <View style={[styles.calendarTop, { backgroundColor: color }]} />
      <View style={[styles.calendarBody, { borderColor: color }]} />
    </View>
  );
}

export function TodayIcon({ color }: IconProps) {
  return (
    <View style={[styles.circle, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
    </View>
  );
}

export function StatsIcon({ color }: IconProps) {
  return (
    <View style={styles.bars}>
      <View style={[styles.bar, styles.barShort, { backgroundColor: color }]} />
      <View style={[styles.bar, styles.barMid, { backgroundColor: color }]} />
      <View style={[styles.bar, styles.barTall, { backgroundColor: color }]} />
    </View>
  );
}

export function SettingsIcon({ color }: IconProps) {
  return (
    <View style={[styles.dial, { borderColor: color }]}>
      <View style={[styles.dialCore, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: 22,
    height: 22,
  },
  calendarTop: {
    height: 6,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  calendarBody: {
    flex: 1,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  bars: {
    width: 22,
    height: 22,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  bar: {
    width: 4,
    borderRadius: 2,
  },
  barShort: {
    height: 8,
  },
  barMid: {
    height: 14,
  },
  barTall: {
    height: 20,
  },
  dial: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialCore: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
