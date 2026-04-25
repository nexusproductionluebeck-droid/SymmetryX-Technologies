import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { AiInsight } from '@magnax/shared';

import { GlassCard } from '@/components/GlassCard';
import { formatRelative } from '@/services/aiEngine';

interface Props {
  active: boolean;
  onActivate: () => void;
  insights: AiInsight[];
}

/**
 * MAGNA-X KI panel. When inactive, shows a CTA card with pulsing
 * brand accent. When active, shows the live list of recognised
 * patterns with confidence bars, tone-coloured dots, and relative
 * timestamps.
 */
export function AiInsightsCard({ active, onActivate, insights }: Props) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (!active) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1400, easing: Easing.out(Easing.sin) }),
          withTiming(0, { duration: 1400, easing: Easing.in(Easing.sin) }),
        ),
        -1,
        false,
      );
    } else {
      pulse.value = 0.4;
    }
  }, [active, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + pulse.value * 0.7,
    transform: [{ scale: 0.9 + pulse.value * 0.15 }],
  }));

  return (
    <GlassCard style={styles.card} glow>
      <View style={styles.header}>
        <Animated.View style={[styles.brainDot, pulseStyle]} />
        <Text style={styles.eyebrow}>MAGNA-X KI · MUSTERERKENNUNG</Text>
      </View>

      {!active ? (
        <View style={styles.cta}>
          <Text style={styles.ctaTitle}>Lernt dein Zuhause kennen</Text>
          <Text style={styles.ctaBody}>
            Die KI erkennt lokal Muster aus Bewegung, Luft, Temperatur und Licht — und schlägt
            passende Automationen vor. Keine Cloud. Keine Fremdanalyse.
          </Text>
          <Pressable style={styles.ctaButton} onPress={onActivate}>
            <Text style={styles.ctaButtonText}>KI aktivieren</Text>
          </Pressable>
        </View>
      ) : insights.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Noch keine Muster</Text>
          <Text style={styles.emptyBody}>
            Die KI braucht ein paar Tage Sensor-Historie, bevor sie verlässliche Muster
            erkennt.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {insights.map((insight) => (
            <InsightRow key={insight.id} insight={insight} />
          ))}
        </View>
      )}
    </GlassCard>
  );
}

function InsightRow({ insight }: { insight: AiInsight }) {
  const color =
    insight.tone === 'alert'
      ? '#D6584E'
      : insight.tone === 'advisory'
        ? '#E09A46'
        : '#1A8A7D';

  return (
    <View style={rowStyles.wrap}>
      <View style={[rowStyles.dot, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <View style={rowStyles.headerLine}>
          <Text style={rowStyles.title}>{insight.title}</Text>
          <Text style={rowStyles.time}>{formatRelative(insight.detectedAt)}</Text>
        </View>
        <Text style={rowStyles.body}>{insight.body}</Text>
        <View style={rowStyles.confRow}>
          <View style={rowStyles.confBarTrack}>
            <View
              style={[
                rowStyles.confBarFill,
                {
                  width: `${Math.round(insight.confidence * 100)}%`,
                  backgroundColor: color,
                },
              ]}
            />
          </View>
          <Text style={rowStyles.confValue}>
            {Math.round(insight.confidence * 100)}%
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 18, shadowColor: '#7C5CE6' },
  header: { flexDirection: 'row', alignItems: 'center' },
  brainDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7C5CE6',
    marginRight: 10,
    shadowColor: '#7C5CE6',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  eyebrow: {
    color: 'rgba(232,238,243,0.75)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '700',
  },
  cta: { paddingTop: 14 },
  ctaTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  ctaBody: {
    color: 'rgba(232,238,243,0.7)',
    fontSize: 13,
    marginTop: 8,
    lineHeight: 19,
  },
  ctaButton: {
    marginTop: 14,
    backgroundColor: 'rgba(124,92,230,0.28)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#7C5CE6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  ctaButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', letterSpacing: 0.4 },
  list: { marginTop: 14 },
  empty: { paddingTop: 14 },
  emptyTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  emptyBody: {
    color: 'rgba(232,238,243,0.6)',
    fontSize: 12.5,
    marginTop: 6,
    lineHeight: 18,
  },
});

const rowStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 10,
  },
  headerLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { color: '#FFFFFF', fontSize: 13.5, fontWeight: '700', flex: 1 },
  time: {
    color: 'rgba(232,238,243,0.5)',
    fontSize: 10,
    fontVariant: ['tabular-nums'],
    marginLeft: 8,
  },
  body: {
    color: 'rgba(232,238,243,0.7)',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },
  confRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  confBarTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    marginRight: 8,
  },
  confBarFill: { height: 4, borderRadius: 2 },
  confValue: {
    color: 'rgba(232,238,243,0.75)',
    fontSize: 10,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'right',
  },
});
