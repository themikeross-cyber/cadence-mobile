export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  card: 16,
  control: 12,
} as const;

export const type = {
  title: 24,
  body: 17,
  caption: 13,
} as const;

export type ThemeColors = {
  background: string;
  surface: string;
  accent: string;
  text: string;
  muted: string;
  border: string;
  danger: string;
  onAccent: string;
  overlay: string;
};

export const darkColors: ThemeColors = {
  background: '#0F0D0E',
  surface: '#1C1A1B',
  accent: '#FCBA28',
  text: '#F9F4DA',
  muted: '#A39E93',
  border: 'rgba(249, 244, 218, 0.08)',
  danger: '#E15A4A',
  onAccent: '#1C1A1B',
  overlay: 'rgba(0, 0, 0, 0.62)',
};

export const lightColors: ThemeColors = {
  background: '#F6F1E7',
  surface: '#FFFDF8',
  accent: '#FCBA28',
  text: '#1C1A1B',
  muted: '#6F6A62',
  border: 'rgba(28, 26, 27, 0.08)',
  danger: '#C4483A',
  onAccent: '#1C1A1B',
  overlay: 'rgba(28, 26, 27, 0.4)',
};
