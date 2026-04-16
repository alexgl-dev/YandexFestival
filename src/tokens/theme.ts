/** Design tokens as TypeScript constants for programmatic access */

export const colors = {
  blue: '#4161FF',
  blueDark: '#2530A2',
  bluePressed: '#2D44B9',
  black: '#141414',
  blackPressed: '#242424',
  white: '#FFFFFF',
  greyLight: '#F4F4F4',
  greySecondary: '#E3E2E0',
  greyDisabled: '#C0C0C0',
  orange: '#FB4E14',
  red: '#FF3300',
  green: '#40B551',
  yellow: '#FFA600',
} as const;

export const spacing = {
  xs: 8,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 30,
  '2xl': 40,
} as const;

export const radius = {
  xs: 5,
  sm: 8,
  lg: 32,
  full: 999,
} as const;

export const fontSize = {
  xs: 24,
  sm: 28,
  md: 32,
  lg: 36,
  xl: 40,
  '2xl': 44,
  '3xl': 50,
  '4xl': 54,
} as const;
