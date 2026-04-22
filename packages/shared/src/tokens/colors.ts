export const colors = {
  navy: '#1B3A5C',
  blue: '#2E75B6',
  teal: '#1A8A7D',
  dark: '#2D2D2D',
  gray: '#666666',
  lightGray: '#F5F8FA',
  white: '#FFFFFF',
  green: '#2E7D32',
  orange: '#E65100',
  red: '#C62828',
  black: '#0A0F14',
} as const;

export const semanticColors = {
  light: {
    background: colors.lightGray,
    surface: colors.white,
    surfaceRaised: colors.white,
    textPrimary: colors.dark,
    textSecondary: colors.gray,
    accent: colors.blue,
    brand: colors.navy,
    success: colors.green,
    warning: colors.orange,
    danger: colors.red,
    online: colors.green,
    offline: colors.gray,
    magnetic: colors.teal,
    border: '#E2E8EE',
  },
  dark: {
    background: colors.black,
    surface: '#111820',
    surfaceRaised: '#182029',
    textPrimary: '#E8EEF3',
    textSecondary: '#8A99A8',
    accent: colors.blue,
    brand: colors.teal,
    success: '#4CAF50',
    warning: '#FF9800',
    danger: '#EF5350',
    online: '#4CAF50',
    offline: '#4E5967',
    magnetic: colors.teal,
    border: '#1F2933',
  },
} as const;

export type ColorToken = keyof typeof colors;
export type SemanticColorToken = keyof typeof semanticColors.light;
export type ThemeMode = 'light' | 'dark';

export function getSemanticColors(mode: ThemeMode) {
  return semanticColors[mode];
}
