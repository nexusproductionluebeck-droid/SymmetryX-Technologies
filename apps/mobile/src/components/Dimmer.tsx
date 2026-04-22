import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/theme/ThemeProvider';

interface Props {
  value: number;
  onChange: (next: number) => void;
  onCommit?: (next: number) => void;
  min?: number;
  max?: number;
  label?: string;
  disabled?: boolean;
}

const TRACK_WIDTH = 280;

/**
 * Horizontal dimmer slider with a thick glass-like track.
 * Used for brightness (0–100) and any other 0–100 value.
 */
export function Dimmer({
  value,
  onChange,
  onCommit,
  min = 0,
  max = 100,
  label,
  disabled = false,
}: Props) {
  const theme = useTheme();
  const range = max - min;
  const translate = useSharedValue(((value - min) / range) * TRACK_WIDTH);

  const emit = useCallback(
    (next: number) => {
      onChange(next);
    },
    [onChange],
  );

  const commit = useCallback(
    (next: number) => {
      onCommit?.(next);
    },
    [onCommit],
  );

  const haptic = useCallback(() => {
    void Haptics.selectionAsync();
  }, []);

  const startValue = useSharedValue(0);

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .onBegin(() => {
      startValue.value = translate.value;
    })
    .onUpdate((event) => {
      const clamped = Math.max(0, Math.min(TRACK_WIDTH, startValue.value + event.translationX));
      translate.value = clamped;
      const next = Math.round(min + (clamped / TRACK_WIDTH) * range);
      runOnJS(emit)(next);
    })
    .onEnd(() => {
      const next = Math.round(min + (translate.value / TRACK_WIDTH) * range);
      runOnJS(commit)(next);
      runOnJS(haptic)();
    });

  const fillStyle = useAnimatedStyle(() => ({ width: translate.value }));
  const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translate.value - 14 }] }));

  return (
    <View style={styles.wrap}>
      {label !== undefined && (
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
      )}
      <GestureDetector gesture={pan}>
        <View style={[styles.track, { backgroundColor: theme.colors.surfaceRaised }]}>
          <Animated.View
            style={[styles.fill, { backgroundColor: theme.palette.teal }, fillStyle]}
          />
          <Animated.View style={[styles.knob, { backgroundColor: theme.palette.white }, knobStyle]} />
        </View>
      </GestureDetector>
      <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{value}%</Text>
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
    overflow: 'visible',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 9,
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
  value: { fontSize: 28, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
