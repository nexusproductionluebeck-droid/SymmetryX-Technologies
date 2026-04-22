import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

interface Props {
  size?: number;
  brightness: number;
  colorTempK: number;
}

/**
 * Visualises the current lamp state as a physical halo — the hotter
 * + brighter the state, the brighter and warmer the glow. Used behind
 * the radial dimmer on the Device Detail screen to give the feeling
 * that the UI emits light.
 */
export function LightHalo({ size = 320, brightness, colorTempK }: Props) {
  const tempHex = kelvinToHex(colorTempK);
  const opacity = Math.max(0.08, Math.min(0.72, brightness / 100));

  return (
    <View style={[styles.wrap, { width: size, height: size }]} pointerEvents="none">
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="halo" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={tempHex} stopOpacity={opacity} />
            <Stop offset="0.55" stopColor={tempHex} stopOpacity={opacity * 0.45} />
            <Stop offset="1" stopColor={tempHex} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#halo)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
});

/**
 * Approximate Planckian-locus color for a color temperature in Kelvin.
 * Good enough for visual feedback — no need for full CIE accuracy here.
 */
function kelvinToHex(k: number): string {
  const t = clamp(k, 2000, 8000) / 100;
  const r =
    t <= 66 ? 255 : Math.round(329.698727446 * Math.pow(t - 60, -0.1332047592));
  const g =
    t <= 66
      ? Math.round(99.4708025861 * Math.log(t) - 161.1195681661)
      : Math.round(288.1221695283 * Math.pow(t - 60, -0.0755148492));
  const b =
    t >= 66
      ? 255
      : t <= 19
        ? 0
        : Math.round(138.5177312231 * Math.log(t - 10) - 305.0447927307);

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function toHex(n: number): string {
  return clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
}
