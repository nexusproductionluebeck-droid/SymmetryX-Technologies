import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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

const WINDOW_HEIGHT = 160;
const WINDOW_WIDTH = 120;
const SLAT_COUNT = 12;

const PRESETS: ReadonlyArray<{ label: string; value: number }> = [
  { label: 'Offen', value: 0 },
  { label: 'Halb', value: 50 },
  { label: 'Zu', value: 100 },
];

/**
 * Animated blind visualisation. Same frame + slat aesthetic as
 * before, but the control now mirrors the window tile: three
 * segment presets (Offen / Halb / Zu) for quick states, plus a
 * vertical drag inside the frame for fine positioning. No
 * numeric percent readout — the silhouette speaks for itself.
 */
export function BlindSlider({ position, onChange, onCommit }: Props) {
  const clamped = Math.max(0, Math.min(100, position));
  const translate = useSharedValue(clamped);
  translate.value = clamped;

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

  const activePreset = clamped < 15 ? 0 : clamped > 85 ? 2 : 1;

  const handlePreset = (value: number) => {
    void Haptics.selectionAsync();
    onChange(value);
    onCommit?.(value);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>JALOUSIE</Text>

      <GestureDetector gesture={pan}>
        <View style={styles.frame}>
          <LinearGradient
            colors={['#1B3A5C', '#2E75B6', '#4DA3E0']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          <View style={styles.horizon} />

          <Animated.View style={[styles.roller, rollerStyle]}>
            <LinearGradient colors={['#222', '#111']} style={StyleSheet.absoluteFill} />
            {Array.from({ length: SLAT_COUNT }).map((_, i) => (
              <View key={i} style={[styles.slat, { top: (i * WINDOW_HEIGHT) / SLAT_COUNT }]} />
            ))}
          </Animated.View>

          <View style={styles.frameBorder} pointerEvents="none" />
          <View style={styles.frameMullion} pointerEvents="none" />
        </View>
      </GestureDetector>

      <View style={styles.segments}>
        {PRESETS.map((preset, i) => (
          <Pressable
            key={preset.label}
            onPress={() => handlePreset(preset.value)}
            style={[segmentStyles.button, activePreset === i && segmentStyles.buttonActive]}
          >
            <Text
              style={[segmentStyles.label, activePreset === i && segmentStyles.labelActive]}
            >
              {preset.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  eyebrow: {
    color: 'rgba(232,238,243,0.55)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '600',
    marginBottom: 10,
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
  segments: { flexDirection: 'row', marginTop: 12 },
});

const segmentStyles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginHorizontal: 3,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  buttonActive: {
    backgroundColor: 'rgba(26,138,125,0.3)',
    borderColor: '#1A8A7D',
  },
  label: { color: 'rgba(232,238,243,0.7)', fontSize: 12, fontWeight: '600' },
  labelActive: { color: '#FFFFFF' },
});
