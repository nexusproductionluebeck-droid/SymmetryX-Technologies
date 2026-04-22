import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  accent?: string;
}

/**
 * Wordless logo mark: a stylised MagnaX-Lock. Two interlocking arcs
 * evoke the magnetic ring + the ceiling puck snapping into it.
 */
export function MagnaXLogoMark({ size = 64, color = '#1A8A7D', accent = '#FFFFFF' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Defs>
        <LinearGradient id="mgx" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={color} stopOpacity={0.9} />
          <Stop offset="1" stopColor={accent} stopOpacity={0.9} />
        </LinearGradient>
      </Defs>
      <Circle cx={32} cy={32} r={28} stroke="url(#mgx)" strokeWidth={3} opacity={0.4} />
      <Path
        d="M16 40 L24 18 L32 34 L40 18 L48 40"
        stroke={accent}
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Circle cx={32} cy={32} r={4} fill={color} />
    </Svg>
  );
}
