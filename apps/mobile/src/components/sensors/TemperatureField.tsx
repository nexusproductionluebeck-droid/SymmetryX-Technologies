import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  temperatureC: number;
  width?: number;
  height?: number;
}

/**
 * Temperature as a thermal gradient field. Cool values skew blue,
 * neutral shades teal, warm readings amber. The temperature number
 * sits on top, its color matched to the field.
 */
export function TemperatureField({ temperatureC, width = 220, height = 120 }: Props) {
  const { color, gradient, mood } = interpret(temperatureC);

  return (
    <View style={styles.wrap}>
      <View style={[styles.stage, { width, height }]}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.overlay}>
          <Text style={[styles.value, { color: '#FFFFFF' }]}>
            {temperatureC.toFixed(1)}
            <Text style={styles.unit}>°C</Text>
          </Text>
          <Text style={[styles.mood, { color }]}>{mood}</Text>
        </View>
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendLabel}>TEMPERATUR</Text>
      </View>
    </View>
  );
}

function interpret(t: number): { color: string; gradient: [string, string, string]; mood: string } {
  if (t < 17) {
    return {
      color: '#7BB6FF',
      gradient: ['rgba(46,117,182,0.65)', 'rgba(46,117,182,0.25)', 'rgba(14,22,30,0.95)'],
      mood: 'Kühl',
    };
  }
  if (t < 20) {
    return {
      color: '#A3DDE0',
      gradient: ['rgba(26,138,125,0.6)', 'rgba(46,117,182,0.3)', 'rgba(14,22,30,0.95)'],
      mood: 'Frisch',
    };
  }
  if (t <= 23) {
    return {
      color: '#1A8A7D',
      gradient: ['rgba(26,138,125,0.55)', 'rgba(26,138,125,0.18)', 'rgba(14,22,30,0.95)'],
      mood: 'Angenehm',
    };
  }
  if (t <= 26) {
    return {
      color: '#E9C87D',
      gradient: ['rgba(224,154,70,0.55)', 'rgba(224,154,70,0.2)', 'rgba(14,22,30,0.95)'],
      mood: 'Warm',
    };
  }
  return {
    color: '#E28A74',
    gradient: ['rgba(214,88,78,0.6)', 'rgba(224,154,70,0.3)', 'rgba(14,22,30,0.95)'],
    mood: 'Heiß',
  };
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 8 },
  stage: { borderRadius: 18, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  overlay: { alignItems: 'center' },
  value: { fontSize: 36, fontWeight: '700', letterSpacing: -1, fontVariant: ['tabular-nums'] },
  unit: { fontSize: 16, fontWeight: '500' },
  mood: { fontSize: 11, letterSpacing: 1.6, fontWeight: '600', marginTop: 4 },
  legend: { alignItems: 'center' },
  legendLabel: {
    color: 'rgba(232,238,243,0.5)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '600',
  },
});
