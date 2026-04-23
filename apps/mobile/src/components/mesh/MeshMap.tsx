import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Line, LinearGradient, RadialGradient, Stop } from 'react-native-svg';
import type { Device } from '@magnax/shared';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  devices: Device[];
  size?: number;
}

interface NodePos {
  id: string;
  x: number;
  y: number;
  isRoot: boolean;
  label: string;
  status: Device['status'];
  kind: 'root' | 'node' | 'leaf';
}

interface Edge {
  from: NodePos;
  to: NodePos;
  phase: number;
  quality: 'strong' | 'medium' | 'weak';
}

/**
 * Living mesh topology.
 *
 * Lays out a virtual gateway (root) at the centre surrounded by one
 * ring of MAGNA-X nodes. Edges are drawn from the root to every
 * node and between adjacent ring nodes to imply redundancy. On each
 * edge, one data packet travels continuously from source to target,
 * looping — the network reads as "alive" at a glance.
 *
 * A periodic "pulse wave" radiates from the root outward as visual
 * confirmation that the mesh is self-coordinating.
 */
export function MeshMap({ devices, size = 320 }: Props) {
  const { nodes, edges } = useMemo(() => layoutMesh(devices, size), [devices, size]);

  // Global tick shared across all particles.
  const tick = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    tick.value = withRepeat(
      withTiming(1, { duration: 2600, easing: Easing.linear }),
      -1,
      false,
    );
    pulse.value = withRepeat(
      withTiming(1, { duration: 4800, easing: Easing.out(Easing.quad) }),
      -1,
      false,
    );
  }, [tick, pulse]);

  const pulseProps = useAnimatedProps(() => ({
    r: 12 + pulse.value * (size * 0.45),
    opacity: (1 - pulse.value) * 0.35,
  }));

  const center = size / 2;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="bg" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#1A8A7D" stopOpacity={0.12} />
            <Stop offset="1" stopColor="#1A8A7D" stopOpacity={0} />
          </RadialGradient>
          <LinearGradient id="edgeStrong" x1="0" y1="0" x2={size} y2={size}>
            <Stop offset="0" stopColor="#1A8A7D" stopOpacity={0.15} />
            <Stop offset="0.5" stopColor="#1A8A7D" stopOpacity={0.55} />
            <Stop offset="1" stopColor="#2E75B6" stopOpacity={0.15} />
          </LinearGradient>
          <LinearGradient id="edgeMedium" x1="0" y1="0" x2={size} y2={size}>
            <Stop offset="0" stopColor="#2E75B6" stopOpacity={0.12} />
            <Stop offset="0.5" stopColor="#2E75B6" stopOpacity={0.4} />
            <Stop offset="1" stopColor="#2E75B6" stopOpacity={0.12} />
          </LinearGradient>
          <LinearGradient id="edgeWeak" x1="0" y1="0" x2={size} y2={size}>
            <Stop offset="0" stopColor="#E09A46" stopOpacity={0.1} />
            <Stop offset="0.5" stopColor="#E09A46" stopOpacity={0.35} />
            <Stop offset="1" stopColor="#E09A46" stopOpacity={0.1} />
          </LinearGradient>
        </Defs>

        <Circle cx={center} cy={center} r={size * 0.48} fill="url(#bg)" />

        {/* Concentric grid rings */}
        <Circle cx={center} cy={center} r={size * 0.15} stroke="rgba(255,255,255,0.05)" strokeWidth={1} fill="none" />
        <Circle cx={center} cy={center} r={size * 0.28} stroke="rgba(255,255,255,0.05)" strokeWidth={1} fill="none" />
        <Circle cx={center} cy={center} r={size * 0.4} stroke="rgba(255,255,255,0.05)" strokeWidth={1} fill="none" />

        {/* Self-heal pulse wave */}
        <AnimatedCircle
          cx={center}
          cy={center}
          fill="none"
          stroke="#1A8A7D"
          strokeWidth={1.5}
          animatedProps={pulseProps}
        />

        {/* Edges */}
        {edges.map((edge, idx) => (
          <Line
            key={`edge-${idx}`}
            x1={edge.from.x}
            y1={edge.from.y}
            x2={edge.to.x}
            y2={edge.to.y}
            stroke={
              edge.quality === 'strong'
                ? 'url(#edgeStrong)'
                : edge.quality === 'medium'
                  ? 'url(#edgeMedium)'
                  : 'url(#edgeWeak)'
            }
            strokeWidth={edge.quality === 'weak' ? 1 : 1.5}
          />
        ))}

        {/* Data-packet particles */}
        {edges.map((edge, idx) => (
          <DataPacket key={`packet-${idx}`} edge={edge} tick={tick} />
        ))}

        {/* Nodes */}
        {nodes.map((node) => (
          <MeshNode key={node.id} node={node} />
        ))}
      </Svg>
    </View>
  );
}

function MeshNode({ node }: { node: NodePos }) {
  const color =
    node.status === 'online'
      ? '#1A8A7D'
      : node.status === 'warning'
        ? '#E09A46'
        : node.status === 'offline'
          ? '#D6584E'
          : '#1A8A7D';

  const baseR = node.isRoot ? 10 : 7;
  const haloR = node.isRoot ? 22 : 14;

  return (
    <>
      <Circle cx={node.x} cy={node.y} r={haloR} fill={color} opacity={0.18} />
      <Circle cx={node.x} cy={node.y} r={baseR + 2} fill="#05090F" />
      <Circle cx={node.x} cy={node.y} r={baseR} fill={color} />
      {node.isRoot && (
        <Circle cx={node.x} cy={node.y} r={3} fill="#FFFFFF" />
      )}
    </>
  );
}

function DataPacket({
  edge,
  tick,
}: {
  edge: Edge;
  tick: SharedValue<number>;
}) {
  const props = useAnimatedProps(() => {
    // Stagger each particle by its edge phase
    const local = (tick.value + edge.phase) % 1;
    const x = edge.from.x + (edge.to.x - edge.from.x) * local;
    const y = edge.from.y + (edge.to.y - edge.from.y) * local;
    return { cx: x, cy: y };
  });

  const color =
    edge.quality === 'strong' ? '#FFFFFF' : edge.quality === 'medium' ? '#BCE0FF' : '#E09A46';

  return (
    <AnimatedCircle r={2.4} fill={color} opacity={0.95} animatedProps={props} />
  );
}

function layoutMesh(devices: Device[], size: number): { nodes: NodePos[]; edges: Edge[] } {
  const center = size / 2;
  const ringRadius = size * 0.38;

  const root: NodePos = {
    id: '__root',
    x: center,
    y: center,
    isRoot: true,
    label: 'ROOT',
    status: 'online',
    kind: 'root',
  };

  if (devices.length === 0) {
    return { nodes: [root], edges: [] };
  }

  const ringNodes: NodePos[] = devices.map((d, i) => {
    const angle = (i / devices.length) * Math.PI * 2 - Math.PI / 2;
    return {
      id: d.id,
      x: center + Math.cos(angle) * ringRadius,
      y: center + Math.sin(angle) * ringRadius,
      isRoot: false,
      label: d.name,
      status: d.status,
      kind: d.mesh?.role === 'node' ? 'node' : 'leaf',
    };
  });

  const edges: Edge[] = [];

  // Spokes: root → each ring node
  ringNodes.forEach((n, i) => {
    edges.push({
      from: root,
      to: n,
      phase: (i / Math.max(1, ringNodes.length)) * 0.9,
      quality: n.status === 'online' ? 'strong' : n.status === 'warning' ? 'weak' : 'medium',
    });
  });

  // Chords: adjacent ring nodes (only if 3+ on the ring)
  if (ringNodes.length >= 3) {
    for (let i = 0; i < ringNodes.length; i += 1) {
      const from = ringNodes[i]!;
      const to = ringNodes[(i + 1) % ringNodes.length]!;
      edges.push({
        from,
        to,
        phase: (i / ringNodes.length) * 0.7 + 0.15,
        quality: 'medium',
      });
    }
  }

  return { nodes: [root, ...ringNodes], edges };
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
