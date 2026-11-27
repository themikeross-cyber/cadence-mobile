import { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { darkColors, lightColors, type ThemeColors } from './tokens';
import type { ThemeChoice } from '../data/types';

type ThemeValue = {
  choice: ThemeChoice;
  scheme: 'dark' | 'light';
  colors: ThemeColors;
};

const ThemeContext = createContext<ThemeValue>({
  choice: 'dark',
  scheme: 'dark',
  colors: darkColors,
});

export function ThemeProvider({
  choice,
  children,
}: {
  choice: ThemeChoice;
  children: React.ReactNode;
}) {
  const system = useColorScheme();
  const scheme =
    choice === 'system' ? (system === 'light' ? 'light' : 'dark') : choice;

  const value = useMemo<ThemeValue>(
    () => ({
      choice,
      scheme,
      colors: scheme === 'light' ? lightColors : darkColors,
    }),
    [choice, scheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
