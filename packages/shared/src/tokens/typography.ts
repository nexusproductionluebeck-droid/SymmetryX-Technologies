export const typography = {
  fontFamily: {
    display: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", Roboto, sans-serif',
    body: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Text", Roboto, sans-serif',
    mono: '"JetBrains Mono", Menlo, Consolas, monospace',
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 30,
    '3xl': 38,
    '4xl': 48,
  },
  lineHeight: {
    tight: 1.15,
    snug: 1.3,
    normal: 1.45,
    relaxed: 1.65,
  },
  letterSpacing: {
    tight: -0.4,
    normal: 0,
    wide: 0.5,
  },
} as const;

export type FontSize = keyof typeof typography.size;
export type FontWeight = keyof typeof typography.weight;
