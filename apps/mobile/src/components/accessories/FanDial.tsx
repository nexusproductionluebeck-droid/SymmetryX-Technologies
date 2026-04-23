import { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Path } from 'react-native-svg';

interface Props {
  speed: number;
  onChange: (next: number) => void;
}

const SIZE = 140;
const SPEED_STEPS = [0, 25, 50, 75, 100] as const;

/**
 * Fan dial. Three blades rotate at a rate proportional to the speed
 * value. Tap a preset chip below to step the fan up/down. At 0 the
 * blades freeze; at 100 they spin in ~0.45 s per rotation.
 */
export function FanDial({ speed, onChange }: Props) {
  const clamped = Math.max(0, Math.min(100, speed));
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (clamped === 0) {
      rotation.value = withTiming(rotation.value, { duration: 400 });
      return;
    }
    const durationMs = 1600 - (clamped / 100) * 1100;
    rotation.value = 0;
    rotation.value = withRepeat(
      withTiming(360, { duration: durationMs, easing: Easing.linear }),
      -1,
      false,
    );
  }, [clamped, rotation]);

  const bladesStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const handlePreset = useCallback(
    (v: number) => {
      void Haptics.selectionAsync();
      onChange(v);
    },
    [onChange],
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>LÜFTER</Text>

      <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2 - 2} fill="rgba(46,117,182,0.08)" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
        </Svg>

        <Animated.View style={bladesStyle}>
          <Svg width={SIZE} height={SIZE}>
            {[0, 120, 240].map((angle) => (
              <Path
                key={angle}
                d={bladePath(SIZE, angle)}
                fill="rgba(26,138,125,0.6)"
                stroke="rgba(232,238,243,0.3)"
                strokeWidth={1}
              />
            ))}
            <Circle cx={SIZE / 2} cy={SIZE / 2} r={8} fill="#1A8A7D" />
            <Circle cx={SIZE / 2} cy={SIZE / 2} r={3} fill="#FFFFFF" />
          </Svg>
        </Animated.View>
      </View>

      <View style={styles.segments}>
        {SPEED_STEPS.map((step) => (
          <Pressable
            key={step}
            onPress={() => handlePreset(step)}
            style={[
              segmentStyles.chip,
              clamped === step && segmentStyles.chipActive,
            ]}
          >
            <Text style={[segmentStyles.label, clamped === step && segmentStyles.labelActive]}>
              {step === 0 ? 'Aus' : `${step}%`}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function bladePath(size: number, angleDeg: number): string {
  const cx = size / 2;
  const cy = size / 2;
  const len = size / 2 - 6;
  const ang = (angleDeg * Math.PI) / 180;
  const tipX = cx + Math.cos(ang) * len;
  const tipY = cy + Math.sin(ang) * len;
  const leftAng = ang + Math.PI / 2;
  const rightAng = ang - Math.PI / 2;
  const leftX = cx + Math.cos(leftAng) * 16;
  const leftY = cy + Math.sin(leftAng) * 16;
  const rightX = cx + Math.cos(rightAng) * 6;
  const rightY = cy + Math.sin(rightAng) * 6;
  return `M ${leftX} ${leftY} Q ${tipX} ${tipY} ${rightX} ${rightY} Z`;
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 12 },
  eyebrow: {
    color: 'rgba(232,238,243,0.55)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '600',
  },
  segments: { flexDirection: 'row' },
});

const segmentStyles = StyleSheet.create({
  chip: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    marginHorizontal: 2,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  chipActive: {
    backgroundColor: 'rgba(26,138,125,0.3)',
    borderColor: '#1A8A7D',
  },
  label: { color: 'rgba(232,238,243,0.7)', fontSize: 11, fontWeight: '600' },
  labelActive: { color: '#FFFFFF' },
});
