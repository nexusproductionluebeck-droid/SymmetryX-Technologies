import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/theme/ThemeProvider';

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: 'low' | 'med' | 'high';
  glow?: boolean;
}

/**
 * Glass-morphism surface. Two stacked gradients create the "lit from
 * within" feel without requiring a real blur layer (which hurts perf
 * on lower-end Android).
 */
export function GlassCard({ children, style, intensity = 'med', glow = false }: Props) {
  const theme = useTheme();
  const base =
    intensity === 'low'
      ? ['rgba(24,32,41,0.55)', 'rgba(17,24,32,0.75)']
      : intensity === 'high'
        ? ['rgba(46,117,182,0.14)', 'rgba(17,24,32,0.92)']
        : ['rgba(30,48,70,0.62)', 'rgba(14,22,30,0.82)'];

  return (
    <View
      style={[
        styles.wrap,
        { borderColor: theme.colors.border },
        glow && styles.glow,
        glow && { shadowColor: theme.palette.teal },
        style,
      ]}
    >
      <LinearGradient
        colors={base as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.06)', 'transparent'] as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.5 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  glow: {
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  content: { padding: 20 },
});
