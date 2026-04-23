import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, Line, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

interface Props {
  width?: number;
  height?: number;
  privacyMode: boolean;
  streaming: boolean;
  motionDetected?: boolean;
  label?: string;
  /**
   * Render in compact mode — smaller label, no bottom badge. Used
   * when embedded in grid tiles vs. hero mode.
   */
  compact?: boolean;
}

const AnimatedRect = Animated.createAnimatedComponent(Rect);

/**
 * Simulated live camera feed.
 *
 * We draw a top-down stylised view of a room the way an overhead
 * MAGNA-X Cam would see it — a big wide-angle lens vignette, a floor
 * grid, some furniture silhouettes, and an animated person-like
 * marker that drifts. When privacy mode is on we swap all that for a
 * blur curtain + explicit "Kamera deaktiviert" copy.
 */
export function CameraLiveTile({
  width = 320,
  height = 200,
  privacyMode,
  streaming,
  motionDetected = false,
  label = 'LIVE',
  compact = false,
}: Props) {
  const driftX = useSharedValue(0);
  const driftY = useSharedValue(0);
  const recordPulse = useSharedValue(0);
  const boxPulse = useSharedValue(0);

  useEffect(() => {
    driftX.value = withRepeat(
      withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    driftY.value = withRepeat(
      withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    recordPulse.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [driftX, driftY, recordPulse]);

  useEffect(() => {
    if (motionDetected) {
      boxPulse.value = 1;
      boxPulse.value = withTiming(0, { duration: 2400, easing: Easing.out(Easing.quad) });
    }
  }, [motionDetected, boxPulse]);

  const personStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: -20 + driftX.value * 140 },
      { translateY: -10 + driftY.value * 60 },
    ],
  }));

  const recDotStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + recordPulse.value * 0.65,
  }));

  const detectionStyle = useAnimatedStyle(() => ({
    opacity: boxPulse.value,
    transform: [{ scale: 0.92 + boxPulse.value * 0.1 }],
  }));

  if (privacyMode) {
    return (
      <View style={[styles.wrap, { width, height }]}>
        <LinearGradient
          colors={['#182029', '#0A1520']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.privacyOverlay}>
          <View style={styles.privacyBadge}>
            <View style={styles.privacyDot} />
            <Text style={styles.privacyText}>PRIVATSPHÄRE AKTIV</Text>
          </View>
          <Text style={styles.privacyBody}>Kamera deaktiviert.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { width, height }]}>
      {/* Floor */}
      <LinearGradient
        colors={['#0F1823', '#182735', '#0C1320']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Wide-angle vignette + grid */}
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <Stop offset="0" stopColor="#000" stopOpacity={0} />
            <Stop offset="0.8" stopColor="#000" stopOpacity={0.35} />
            <Stop offset="1" stopColor="#000" stopOpacity={0.75} />
          </RadialGradient>
        </Defs>

        {/* Floor grid */}
        {Array.from({ length: 6 }).map((_, i) => (
          <Line
            key={`h-${i}`}
            x1={0}
            x2={width}
            y1={(height / 6) * (i + 1)}
            y2={(height / 6) * (i + 1)}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={1}
          />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <Line
            key={`v-${i}`}
            x1={(width / 8) * (i + 1)}
            x2={(width / 8) * (i + 1)}
            y1={0}
            y2={height}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={1}
          />
        ))}

        {/* Furniture silhouettes */}
        <Rect
          x={width * 0.06}
          y={height * 0.55}
          width={width * 0.28}
          height={height * 0.3}
          rx={8}
          fill="rgba(26,138,125,0.16)"
          stroke="rgba(26,138,125,0.35)"
          strokeWidth={1}
        />
        <Rect
          x={width * 0.66}
          y={height * 0.16}
          width={width * 0.22}
          height={height * 0.22}
          rx={6}
          fill="rgba(46,117,182,0.18)"
          stroke="rgba(46,117,182,0.4)"
          strokeWidth={1}
        />
        <Rect
          x={width * 0.4}
          y={height * 0.72}
          width={width * 0.18}
          height={height * 0.18}
          rx={4}
          fill="rgba(26,138,125,0.12)"
          stroke="rgba(26,138,125,0.3)"
          strokeWidth={1}
        />

        {/* Vignette on top */}
        <Rect x={0} y={0} width={width} height={height} fill="url(#vignette)" />
      </Svg>

      {/* Moving person marker (top-down) */}
      <Animated.View style={[styles.person, { left: width * 0.42, top: height * 0.42 }, personStyle]}>
        <Svg width={36} height={36} viewBox="0 0 36 36">
          <Circle cx="18" cy="12" r="5" fill="#FFE3B0" stroke="#E09A46" strokeWidth={1.5} />
          <Path d="M 8 28 Q 18 18 28 28" stroke="#E09A46" strokeWidth={3} strokeLinecap="round" fill="none" />
        </Svg>
      </Animated.View>

      {/* Motion detection box */}
      <Animated.View style={[StyleSheet.absoluteFill, detectionStyle]}>
        <Svg width={width} height={height}>
          <Rect
            x={width * 0.38}
            y={height * 0.34}
            width={80}
            height={80}
            fill="none"
            stroke="#1A8A7D"
            strokeWidth={2}
            strokeDasharray="6,4"
          />
        </Svg>
      </Animated.View>

      {/* REC badge */}
      {streaming && (
        <View style={styles.recBadge}>
          <Animated.View style={[styles.recDot, recDotStyle]} />
          <Text style={styles.recText}>{label}</Text>
        </View>
      )}

      {!compact && (
        <View style={styles.bottomBadge}>
          <Text style={styles.bottomText}>DECKENKAMERA · 160°</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  person: { position: 'absolute' },
  recBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  recDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#D6584E',
    marginRight: 6,
  },
  recText: {
    color: '#FFFFFF',
    fontSize: 9,
    letterSpacing: 1.4,
    fontWeight: '700',
  },
  bottomBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  bottomText: {
    color: 'rgba(232,238,243,0.85)',
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  privacyOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26,138,125,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1A8A7D',
  },
  privacyDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#1A8A7D',
    marginRight: 8,
  },
  privacyText: {
    color: '#FFFFFF',
    fontSize: 10,
    letterSpacing: 1.8,
    fontWeight: '700',
  },
  privacyBody: {
    color: 'rgba(232,238,243,0.7)',
    fontSize: 13,
    marginTop: 10,
    fontWeight: '500',
  },
});
