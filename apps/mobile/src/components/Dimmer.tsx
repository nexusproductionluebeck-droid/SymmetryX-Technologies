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
  /** Full width of the slider track in logical pixels. */
  width?: number;
  /** Hide the numeric value readout below the track. */
  hideValue?: boolean;
}

const KNOB_SIZE = 28;

/**
 * Horizontal dimmer slider with a thick glass-like track.
 * Used for brightness (0–100) and any other 0–100 value.
 *
 * Width is parametric so the same primitive can be used in wide
 * hero contexts and inside narrow cards without overflow.
 */
export function Dimmer({
  value,
  onChange,
  onCommit,
  min = 0,
  max = 100,
  label,
  disabled = false,
  width = 280,
  hideValue = false,
}: Props) {
  const theme = useTheme();
  const range = max - min;
  const trackWidth = width;
  const translate = useSharedValue(((value - min) / range) * trackWidth);

  const emit = useCallback((next: number) => onChange(next), [onChange]);
  const commit = useCallback((next: number) => onCommit?.(next), [onCommit]);
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
      const clamped = Math.max(0, Math.min(trackWidth, startValue.value + event.translationX));
      translate.value = clamped;
      const next = Math.round(min + (clamped / trackWidth) * range);
      runOnJS(emit)(next);
    })
    .onEnd(() => {
      const next = Math.round(min + (translate.value / trackWidth) * range);
      runOnJS(commit)(next);
      runOnJS(haptic)();
    });

  const fillStyle = useAnimatedStyle(() => ({ width: translate.value }));
  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translate.value - KNOB_SIZE / 2 }],
  }));

  return (
    <View style={[styles.wrap, { width: trackWidth + KNOB_SIZE }]}>
      {label !== undefined && (
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
      )}
      <GestureDetector gesture={pan}>
        <View
          style={[
            styles.track,
            {
              width: trackWidth,
              backgroundColor: theme.colors.surfaceRaised,
              marginHorizontal: KNOB_SIZE / 2,
            },
          ]}
        >
          <Animated.View
            style={[styles.fill, { backgroundColor: theme.palette.teal }, fillStyle]}
          />
          <Animated.View
            style={[styles.knob, { backgroundColor: theme.palette.white }, knobStyle]}
          />
        </View>
      </GestureDetector>
      {!hideValue && (
        <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{value}%</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 10 },
  label: { fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' },
  track: {
    height: 14,
    borderRadius: 7,
    overflow: 'visible',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 7,
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    position: 'absolute',
    top: -7,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  value: { fontSize: 22, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
