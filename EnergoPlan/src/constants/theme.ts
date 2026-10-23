import '@/global.css';
import { Platform } from 'react-native';

export const Theme = {
  colors: {
    forest: '#153F35',
    forestDark: '#0D2721',
    forestLight: '#1E4E42',
    green: '#276C50',
    greenLight: '#328864',
    lime: '#D4EF97',
    limeHover: '#C4E47A',
    background: '#F5F6F2',
    surface: '#FFFFFF',
    text: '#1C3029',
    muted: '#65756D',
    mutedLight: '#8C9E95',
    border: '#E1E6E2',
    borderLight: '#EDF2EE',
    warningBg: '#FFF4DF',
    warningText: '#8A5A16',
    warningBorder: '#F5DFB5',
    successBg: '#E6F4EA',
    successText: '#137333',
    successBorder: '#CEEAD6',
    dangerBg: '#FCE8E6',
    dangerText: '#C5221F',
    dangerBorder: '#FAD2CF',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radii: {
    xs: 4,
    sm: 6,
    md: 10,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
  },
} as const;

export const Colors = {
  light: {
    text: Theme.colors.text,
    background: Theme.colors.background,
    backgroundElement: Theme.colors.surface,
    backgroundSelected: Theme.colors.forest,
    textSecondary: Theme.colors.muted,
  },
  dark: {
    text: '#ffffff',
    background: '#153F35',
    backgroundElement: '#1E4E42',
    backgroundSelected: '#276C50',
    textSecondary: '#D4EF97',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    serif: 'serif',
    rounded: 'system-ui, sans-serif',
    mono: 'monospace',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 1200;
