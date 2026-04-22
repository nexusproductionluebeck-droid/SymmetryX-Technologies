import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/theme/ThemeProvider';

interface Props {
  valueK: number;
  onChange: (next: number) => void;
  onCommit?: (next: number) => void;
  minK?: number;
  maxK?: number;
}

const TRACK_WIDTH = 280;
const WARM = '#F5B061';
const COLD = '#C3E1FF';

export function ColorTempSlider({
  valueK,
  onChange,
  onCommit,
  minK = 2200,
  maxK = 6500,
}: Props) {
  const theme = useTheme();
  const range = maxK - minK;
  const translate = useSharedValue(((valueK - minK) / range) * TRACK_WIDTH);

  const emit = useCallback((next: number) => onChange(next), [onChange]);
  const commit = useCallback((next: number) => onCommit?.(next), [onCommit]);

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      const clamped = Math.max(0, Math.min(TRACK_WIDTH, translate.value + event.changeX));
      translate.value = clamped;
      const next = Math.round(minK + (clamped / TRACK_WIDTH) * range);
      runOnJS(emit)(next);
    })
    .onEnd(() => {
      const next = Math.round(minK + (translate.value / TRACK_WIDTH) * range);
      runOnJS(commit)(next);
    });

  const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translate.value - 14 }] }));

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Farbtemperatur</Text>
      <GestureDetector gesture={pan}>
        <View style={styles.track}>
          <LinearGradient
            colors={[WARM, '#FFE8C4', COLD]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill as unknown as typeof styles.track}
          />
          <Animated.View style={[styles.knob, { backgroundColor: theme.palette.white }, knobStyle]} />
        </View>
      </GestureDetector>
      <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{valueK} K</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 10 },
  label: { fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' },
  track: {
    width: TRACK_WIDTH,
    height: 18,
    borderRadius: 9,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  knob: {
    width: 28,
    height: 28,
    borderRadius: 14,
    position: 'absolute',
    top: -5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  value: { fontSize: 20, fontWeight: '600', fontVariant: ['tabular-nums'] },
});
