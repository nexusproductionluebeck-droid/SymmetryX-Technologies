import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  /** 0 = fully open, 100 = fully closed. */
  position: number;
  onChange: (next: number) => void;
  onCommit?: (next: number) => void;
}

const WINDOW_HEIGHT = 180;
const WINDOW_WIDTH = 120;
const SLAT_COUNT = 12;

/**
 * Animated blind visualisation. Dragging vertically moves the roller
 * like a real blind — top = open, bottom = closed. The slats appear
 * stacked at the top when open and fully cover the window when closed.
 */
export function BlindSlider({ position, onChange, onCommit }: Props) {
  const clamped = Math.max(0, Math.min(100, position));
  const translate = useSharedValue(clamped);

  const emit = useCallback((v: number) => onChange(Math.round(v)), [onChange]);
  const commit = useCallback(
    (v: number) => {
      void Haptics.selectionAsync();
      onCommit?.(Math.round(v));
    },
    [onCommit],
  );

  const startValue = useSharedValue(0);

  const pan = Gesture.Pan()
    .onBegin(() => {
      startValue.value = translate.value;
    })
    .onUpdate((event) => {
      const deltaPct = (event.translationY / WINDOW_HEIGHT) * 100;
      const next = Math.max(0, Math.min(100, startValue.value + deltaPct));
      translate.value = next;
      runOnJS(emit)(next);
    })
    .onEnd(() => {
      runOnJS(commit)(translate.value);
    });

  const rollerStyle = useAnimatedStyle(() => ({
    height: (translate.value / 100) * WINDOW_HEIGHT,
  }));

  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>JALOUSIE</Text>

      <GestureDetector gesture={pan}>
        <View style={styles.frame}>
          {/* Sky / outside view */}
          <LinearGradient
            colors={['#1B3A5C', '#2E75B6', '#4DA3E0']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          <View style={styles.horizon} />

          {/* Blind roller (grows from top) */}
          <Animated.View style={[styles.roller, rollerStyle]}>
            <LinearGradient
              colors={['#222', '#111']}
              style={StyleSheet.absoluteFill}
            />
            {Array.from({ length: SLAT_COUNT }).map((_, i) => (
              <View key={i} style={[styles.slat, { top: (i * WINDOW_HEIGHT) / SLAT_COUNT }]} />
            ))}
          </Animated.View>

          {/* Window frame */}
          <View style={styles.frameBorder} pointerEvents="none" />
          <View style={styles.frameMullion} pointerEvents="none" />
        </View>
      </GestureDetector>

      <View style={styles.valueRow}>
        <Text style={styles.value}>{Math.round(clamped)}</Text>
        <Text style={styles.unit}>% zu</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 10 },
  eyebrow: {
    color: 'rgba(232,238,243,0.55)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '600',
  },
  frame: {
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#05090F',
  },
  horizon: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: WINDOW_HEIGHT * 0.7,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  roller: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  slat: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  frameBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
  },
  frameMullion: {
    position: 'absolute',
    left: WINDOW_WIDTH / 2 - 0.5,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  valueRow: { flexDirection: 'row', alignItems: 'baseline' },
  value: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  unit: { color: 'rgba(232,238,243,0.55)', fontSize: 12, marginLeft: 4 },
});
