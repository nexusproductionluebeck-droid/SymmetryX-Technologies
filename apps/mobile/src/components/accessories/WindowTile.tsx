import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import type { WindowMode } from '@magnax/shared';

interface Props {
  mode: WindowMode;
  onChange: (next: WindowMode) => void;
}

const FRAME_W = 140;
const FRAME_H = 160;

/**
 * Window state tile. The sash animates between three positions:
 * closed (flush to frame), tilted (top rotates out), fully open
 * (rotated 70°). User taps one of three segments to choose.
 */
export function WindowTile({ mode, onChange }: Props) {
  const rotation = useSharedValue(modeToRotation(mode));
  const translate = useSharedValue(modeToTranslateY(mode));

  rotation.value = withSpring(modeToRotation(mode), { damping: 18, stiffness: 200 });
  translate.value = withSpring(modeToTranslateY(mode), { damping: 18, stiffness: 200 });

  const sashStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 600 },
      { translateY: translate.value },
      { rotateX: `${rotation.value}deg` },
    ],
  }));

  const handlePress = (next: WindowMode) => {
    void Haptics.selectionAsync();
    onChange(next);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>FENSTER</Text>

      <View style={styles.frame}>
        <LinearGradient
          colors={['#1B3A5C', '#2E75B6']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        <Animated.View style={[styles.sash, sashStyle]}>
          <View style={styles.sashInner}>
            <View style={styles.sashMullion} />
          </View>
        </Animated.View>
      </View>

      <View style={styles.segments}>
        <SegmentButton label="Zu" active={mode === 'closed'} onPress={() => handlePress('closed')} />
        <SegmentButton label="Gekippt" active={mode === 'tilt'} onPress={() => handlePress('tilt')} />
        <SegmentButton label="Offen" active={mode === 'open'} onPress={() => handlePress('open')} />
      </View>
    </View>
  );
}

function SegmentButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        segmentStyles.button,
        active && segmentStyles.buttonActive,
      ]}
    >
      <Text style={[segmentStyles.label, active && segmentStyles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

function modeToRotation(mode: WindowMode): number {
  switch (mode) {
    case 'closed': return 0;
    case 'tilt': return -35;
    case 'open': return -70;
  }
}

function modeToTranslateY(mode: WindowMode): number {
  switch (mode) {
    case 'closed': return 0;
    case 'tilt': return -6;
    case 'open': return -14;
  }
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 12 },
  eyebrow: {
    color: 'rgba(232,238,243,0.55)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '600',
  },
  frame: {
    width: FRAME_W,
    height: FRAME_H,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  sash: {
    width: FRAME_W - 24,
    height: FRAME_H - 24,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    transformOrigin: 'top',
  },
  sashInner: { flex: 1, padding: 4 },
  sashMullion: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: '50%',
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  segments: { flexDirection: 'row' },
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
