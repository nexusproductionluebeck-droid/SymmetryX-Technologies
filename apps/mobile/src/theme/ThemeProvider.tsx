import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import {
  colors,
  getSemanticColors,
  radius,
  spacing,
  typography,
  type ThemeMode,
} from '@magnax/shared';

export interface Theme {
  mode: ThemeMode;
  colors: ReturnType<typeof getSemanticColors>;
  palette: typeof colors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
}

interface ThemeContextValue {
  theme: Theme;
  setMode: (mode: ThemeMode | 'system') => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [override, setOverride] = useState<ThemeMode | 'system'>('system');
  const resolvedMode: ThemeMode =
    override === 'system' ? (system === 'dark' ? 'dark' : 'light') : override;

  const value = useMemo<ThemeContextValue>(() => {
    const theme: Theme = {
      mode: resolvedMode,
      colors: getSemanticColors(resolvedMode),
      palette: colors,
      spacing,
      radius,
      typography,
    };
    return { theme, setMode: setOverride };
  }, [resolvedMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx.theme;
}

export function useThemeController(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeController must be used within ThemeProvider');
  return ctx;
}
