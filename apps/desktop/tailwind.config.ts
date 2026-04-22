import type { Config } from 'tailwindcss';
import { colors, semanticColors } from '@magnax/shared';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}', '../../packages/shared/src/**/*.ts'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ...colors,
        brand: {
          navy: colors.navy,
          blue: colors.blue,
          teal: colors.teal,
        },
        surface: {
          DEFAULT: semanticColors.dark.surface,
          raised: semanticColors.dark.surfaceRaised,
          light: semanticColors.light.surface,
        },
        textPrimary: semanticColors.dark.textPrimary,
        textSecondary: semanticColors.dark.textSecondary,
        border: semanticColors.dark.border,
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(46,117,182,0.18), 0 10px 30px -10px rgba(46,117,182,0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
